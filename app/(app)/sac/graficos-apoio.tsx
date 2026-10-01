'use client'

/**
 * Gráfico da avaliação do atendimento por mês (Apoio Comercial, db/030 D8). Recharts como em
 * /metas e /relatorios: `var(--token)` direto no SVG, então troca de tema com a página. Uma
 * série só (a média do mês), a meta como linha de referência tracejada, rótulo de valor em cada
 * barra (são no máximo 3) e a contagem de avaliações no eixo — a tabela do relatório é a vista
 * acessível dos mesmos números.
 */

import { Bar, BarChart, CartesianGrid, LabelList, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

import { formatarDecimal } from '@/lib/sac-apoio'

const EIXO = { fill: 'var(--texto-3)', fontSize: 12 }
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

type Mes = { mes: string; avaliacoes: number; media: number | string | null }

export function GraficoAvaliacaoMensal({ mensal, meta }: { mensal: Mes[]; meta: number | string | null }) {
  const dados = mensal.map((m) => ({
    rotulo: `${MESES[Number(m.mes.slice(5, 7)) - 1]} · ${m.avaliacoes}`,
    media: m.media === null ? null : Number(m.media),
    texto: m.media === null ? 'sem avaliação' : formatarDecimal(m.media),
    avaliacoes: m.avaliacoes,
  }))
  const metaN = meta === null ? null : Number(meta)
  return (
    <div className="ap-grafico" role="img" aria-label={`Média da avaliação por mês: ${dados.map((d) => `${d.rotulo} avaliações, ${d.texto}`).join('; ')}`}>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={dados} margin={{ top: 22, right: 12, bottom: 0, left: -12 }} barCategoryGap="38%">
          <CartesianGrid vertical={false} stroke="var(--borda)" strokeWidth={1} />
          <XAxis dataKey="rotulo" tick={EIXO} axisLine={{ stroke: 'var(--borda-forte)' }} tickLine={false} />
          <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={EIXO} axisLine={false} tickLine={false} width={40} />
          <Tooltip
            cursor={{ fill: 'var(--fundo-2)' }}
            content={({ active, payload }) => {
              const p = active ? (payload?.[0]?.payload as (typeof dados)[number] | undefined) : undefined
              return p ? (
                <div className="ap-dica">
                  <strong>{p.rotulo.split(' · ')[0]}</strong>
                  <span>
                    média {p.texto} · {p.avaliacoes} avaliação(ões)
                  </span>
                </div>
              ) : null
            }}
          />
          {metaN !== null ? (
            <ReferenceLine
              y={metaN}
              stroke="var(--texto-2)"
              strokeDasharray="4 4"
              label={{ value: `meta ${formatarDecimal(metaN)}`, position: 'insideTopRight', fill: 'var(--texto-2)', fontSize: 12 }}
            />
          ) : null}
          <Bar dataKey="media" fill="var(--azul-vivo)" radius={[4, 4, 0, 0]} maxBarSize={56} isAnimationActive={false}>
            <LabelList dataKey="texto" position="top" fill="var(--texto)" fontSize={12} fontWeight={600} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
