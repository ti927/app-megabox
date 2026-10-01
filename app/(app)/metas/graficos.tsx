'use client'

/**
 * Gráficos da página metas (Análise de Entregas e Relatório Anual). Recharts, como em
 * /relatorios: SVG com `var(--token)` direto no atributo, então o gráfico troca de tema com a
 * página. Regras da skill dataviz: barras finas com ponta de 4px e base reta, linha de 2px,
 * marcador com anel da cor da superfície, grade fina, um eixo só (nunca dois eixos Y), rótulo
 * de valor seletivo e texto sempre em cor de texto — a cor da série fica na marca.
 */

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  LabelList,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { formatarReais } from '@/lib/dinheiro'

const EIXO = { fill: 'var(--mt-graf-eixo)', fontSize: 12 }
const ROTULO = { fill: 'var(--texto-2)', fontSize: 12, fontWeight: 600 }

/** R$ compacto para eixo: R$ 12k, R$ 1,2M. Só desenho. */
export function reaisCompacto(v: number): string {
  const a = Math.abs(v)
  if (a >= 1e6) return `R$ ${(v / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}M`
  if (a >= 1e3) return `R$ ${(v / 1e3).toLocaleString('pt-BR', { maximumFractionDigits: 0 })}k`
  return `R$ ${v.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
}

type LinhaDica = { cor?: string; rotulo: string; valor: string }
export function Dica({ titulo, linhas }: { titulo?: string; linhas: LinhaDica[] }) {
  return (
    <div className="mt-dica">
      {titulo ? <strong>{titulo}</strong> : null}
      {linhas.map((l) => (
        <span key={l.rotulo} className="mt-dica-linha">
          {l.cor ? <i style={{ background: l.cor }} aria-hidden /> : null}
          <span>{l.rotulo}</span>
          <b>{l.valor}</b>
        </span>
      ))}
    </div>
  )
}

// ------------------------------------------------------------ barras da Análise de Entregas
export type BarraVendedor = {
  chave: string
  /** nome em duas linhas: primeiro nome e o resto */
  primeiro: string
  resto: string
  completo: string
  qtd: number
  comissao: string
}

/**
 * Uma barra por vendedor: ALTURA = nº de entregas (a contagem do HTML A), rótulo no topo = a
 * comissão somada, e a contagem sob a barra. Clicar (ou Enter no botão da legenda abaixo)
 * abre as entregas da barra.
 */
export function BarrasVendedor({
  dados,
  cor,
  descricao,
  aoEscolher,
}: {
  dados: BarraVendedor[]
  cor: string
  descricao: string
  aoEscolher: (b: BarraVendedor) => void
}) {
  return (
    <div className="mt-analise-grafico" role="img" aria-label={descricao}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 26, right: 4, bottom: 0, left: 4 }} barCategoryGap="24%">
          <CartesianGrid vertical={false} stroke="var(--mt-graf-grade)" />
          <XAxis dataKey="chave" hide />
          <YAxis hide allowDecimals={false} domain={[0, (m: number) => Math.max(1, m)]} />
          <Tooltip
            cursor={{ fill: 'var(--mt-graf-cursor)' }}
            content={({ active, payload }) => {
              const b = payload?.[0]?.payload as BarraVendedor | undefined
              return active && b ? (
                <Dica
                  titulo={b.completo}
                  linhas={[
                    { cor, rotulo: 'Entregas', valor: String(b.qtd) },
                    { rotulo: 'Comissão', valor: formatarReais(b.comissao) },
                  ]}
                />
              ) : null
            }}
          />
          <Bar
            dataKey="qtd"
            fill={cor}
            maxBarSize={56}
            radius={[4, 4, 0, 0]}
            isAnimationActive={false}
            cursor="pointer"
            onClick={(d) => aoEscolher((d as unknown as { payload: BarraVendedor }).payload)}
          >
            <LabelList
              dataKey="comissao"
              position="top"
              formatter={(v: unknown) => formatarReais(String(v))}
              {...ROTULO}
              fontSize={11}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ------------------------------------------------------------------- relatório anual
export type PontoMes = { mes: string; [serie: string]: number | string }
export type Serie = { chave: string; nome: string; cor: string; tipo?: 'barra' | 'linha' | 'tracejada' }

/** Colunas por mês (uma ou mais séries) com linha opcional — sempre UM eixo Y em R$. */
export function ColunasMes({
  dados,
  series,
  descricao,
  altura = 280,
}: {
  dados: PontoMes[]
  series: Serie[]
  descricao: string
  altura?: number
}) {
  return (
    <div className="mt-anual-grafico" role="img" aria-label={descricao} style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={dados} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barGap={2} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="var(--mt-graf-grade)" />
          <XAxis dataKey="mes" tick={EIXO} axisLine={{ stroke: 'var(--mt-graf-grade)' }} tickLine={false} interval={0} />
          <YAxis tick={EIXO} tickFormatter={reaisCompacto} axisLine={false} tickLine={false} width={64} />
          <Tooltip
            cursor={{ fill: 'var(--mt-graf-cursor)' }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <Dica
                  titulo={String(label)}
                  linhas={series.map((s) => ({
                    cor: s.cor,
                    rotulo: s.nome,
                    valor: formatarReais(String((payload[0]!.payload as PontoMes)[`${s.chave}_txt`] ?? '0')),
                  }))}
                />
              ) : null
            }
          />
          {series.length > 1 ? <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, color: 'var(--texto-2)' }} /> : null}
          {series.map((s) =>
            s.tipo === 'linha' || s.tipo === 'tracejada' ? (
              <Line
                key={s.chave}
                dataKey={s.chave}
                name={s.nome}
                stroke={s.cor}
                strokeWidth={2}
                strokeDasharray={s.tipo === 'tracejada' ? '5 4' : undefined}
                dot={{ r: 4, fill: s.cor, stroke: 'var(--superficie)', strokeWidth: 2 }}
                isAnimationActive={false}
              />
            ) : (
              <Bar key={s.chave} dataKey={s.chave} name={s.nome} fill={s.cor} maxBarSize={22} radius={[4, 4, 0, 0]} isAnimationActive={false} />
            ),
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}

/** Duas áreas (comissões de vendedores e MegaBox) — mesmo eixo, mesma unidade. */
export function AreasMes({ dados, series, descricao }: { dados: PontoMes[]; series: Serie[]; descricao: string }) {
  return (
    <div className="mt-anual-grafico" role="img" aria-label={descricao}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--mt-graf-grade)" />
          <XAxis dataKey="mes" tick={EIXO} axisLine={{ stroke: 'var(--mt-graf-grade)' }} tickLine={false} interval={0} />
          <YAxis tick={EIXO} tickFormatter={reaisCompacto} axisLine={false} tickLine={false} width={64} />
          <Tooltip
            cursor={{ stroke: 'var(--mt-graf-eixo)', strokeWidth: 1 }}
            content={({ active, payload, label }) =>
              active && payload?.length ? (
                <Dica
                  titulo={String(label)}
                  linhas={series.map((s) => ({
                    cor: s.cor,
                    rotulo: s.nome,
                    valor: formatarReais(String((payload[0]!.payload as PontoMes)[`${s.chave}_txt`] ?? '0')),
                  }))}
                />
              ) : null
            }
          />
          <Legend iconType="circle" iconSize={9} wrapperStyle={{ fontSize: 12, color: 'var(--texto-2)' }} />
          {series.map((s) => (
            <Area
              key={s.chave}
              dataKey={s.chave}
              name={s.nome}
              type="monotone"
              stroke={s.cor}
              strokeWidth={2}
              fill={s.cor}
              fillOpacity={0.1}
              dot={{ r: 3, fill: s.cor, stroke: 'var(--superficie)', strokeWidth: 2 }}
              isAnimationActive={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

export type Fatia = { chave: string; nome: string; valor: number; texto: string; cor: string }

/** Rosca da participação por vendedor (7 maiores + "Demais"). */
export function RoscaParticipacao({ fatias, descricao }: { fatias: Fatia[]; descricao: string }) {
  const total = fatias.reduce((s, f) => s + f.valor, 0)
  return (
    <div className="mt-anual-rosca">
      <div className="mt-anual-rosca-grafico" role="img" aria-label={descricao}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={fatias}
              dataKey="valor"
              nameKey="nome"
              innerRadius="62%"
              outerRadius="100%"
              stroke="var(--superficie)"
              strokeWidth={2}
              startAngle={90}
              endAngle={-270}
              isAnimationActive={false}
            >
              {fatias.map((f) => (
                <Cell key={f.chave} fill={f.cor} />
              ))}
            </Pie>
            <Tooltip
              content={({ active, payload }) => {
                const f = payload?.[0]?.payload as Fatia | undefined
                return active && f ? (
                  <Dica
                    linhas={[
                      {
                        cor: f.cor,
                        rotulo: f.nome,
                        valor: `${formatarReais(f.texto)} (${total ? ((f.valor / total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : 0}%)`,
                      },
                    ]}
                  />
                ) : null
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-anual-legenda">
        {fatias.map((f) => (
          <li key={f.chave}>
            <i style={{ background: f.cor }} aria-hidden />
            <span>{f.nome}</span>
            <b className="mt-num">{total ? ((f.valor / total) * 100).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : 0}%</b>
          </li>
        ))}
      </ul>
    </div>
  )
}

export type BarraH = { chave: string; nome: string; valor: number; texto: string }

/** Ranking do ano: barras horizontais com o valor na ponta. Uma série, sem legenda. */
export function BarrasRanking({ dados, descricao, cor }: { dados: BarraH[]; descricao: string; cor: string }) {
  const altura = Math.max(140, dados.length * 30 + 20)
  return (
    <div className="mt-anual-grafico" role="img" aria-label={descricao} style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 96, bottom: 4, left: 4 }} barCategoryGap={6}>
          <CartesianGrid horizontal={false} stroke="var(--mt-graf-grade)" />
          <XAxis type="number" tick={EIXO} tickFormatter={reaisCompacto} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="nome"
            width={150}
            tick={{ fill: 'var(--texto-2)', fontSize: 12 }}
            tickFormatter={(n: string) => (n.length > 22 ? `${n.slice(0, 21)}…` : n)}
            axisLine={{ stroke: 'var(--mt-graf-grade)' }}
            tickLine={false}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: 'var(--mt-graf-cursor)' }}
            content={({ active, payload }) => {
              const b = payload?.[0]?.payload as BarraH | undefined
              return active && b ? <Dica titulo={b.nome} linhas={[{ cor, rotulo: 'Acumulado', valor: formatarReais(b.texto) }]} /> : null
            }}
          />
          <Bar dataKey="valor" fill={cor} maxBarSize={18} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            <LabelList dataKey="texto" position="right" formatter={(v: unknown) => formatarReais(String(v))} {...ROTULO} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
