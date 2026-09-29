'use client'

/**
 * Gráficos dos relatórios — os mesmos tipos que os blocos HTML do Bubble desenhavam com
 * Chart.js (rosca, funil, barras horizontais, linha com área, colunas) e o anel de cobertura.
 *
 * Biblioteca: Recharts. É SVG: a cor é `var(--token)` direto no atributo, então o gráfico troca
 * de tema junto com a página, sem ler cor com getComputedStyle nem redesenhar canvas (o que o
 * Chart.js exigiria). Componível em JSX, com tooltip e legenda próprios.
 *
 * Regras de desenho (skill dataviz): barras finas (≤ 22px) com ponta arredondada de 4px e base
 * reta, linha de 2px, marcadores com anel da cor da superfície, grade em linha fina e sólida,
 * rótulo de valor seletivo e texto sempre em cor de texto (nunca na cor da série).
 */

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Funnel,
  FunnelChart,
  LabelList,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const EIXO = { fill: 'var(--graf-eixo)', fontSize: 12 }
const EIXO_NOME = { fill: 'var(--texto-2)', fontSize: 12 }
const ROTULO = { fill: 'var(--texto-2)', fontSize: 12, fontWeight: 600 }

/** Corta o texto com reticências (rótulo de eixo em uma linha). */
function cortar(texto: string, max: number): string {
  return texto.length > max ? `${texto.slice(0, Math.max(1, max - 1)).trimEnd()}…` : texto
}

type LinhaDica = { cor?: string; rotulo: string; valor: string }

/** Caixa de tooltip comum: título e linhas "● rótulo  valor". */
function Dica({ titulo, linhas }: { titulo?: string; linhas: LinhaDica[] }) {
  return (
    <div className="rel-dica">
      {titulo ? <strong>{titulo}</strong> : null}
      {linhas.map((l) => (
        <span key={l.rotulo} className="rel-dica-linha">
          {l.cor ? <i style={{ background: l.cor }} aria-hidden /> : null}
          <span>{l.rotulo}</span>
          <b>{l.valor}</b>
        </span>
      ))}
    </div>
  )
}

// ----------------------------------------------------------------------------- rosca
export type Fatia = { chave: string; nome: string; valor: number; cor: string }

/** Rosca (ou pizza cheia com `cheia`). Sem dado: anel cinza, como o HTML ("Sem arquivamentos"). */
export function Rosca({
  fatias,
  descricao,
  cheia = false,
  formatar,
}: {
  fatias: Fatia[]
  descricao: string
  cheia?: boolean
  formatar: (f: Fatia) => string
}) {
  const vazia = fatias.every((f) => f.valor === 0)
  const dados = vazia ? [{ chave: 'vazio', nome: 'Sem dados', valor: 1, cor: 'var(--graf-vazio)' }] : fatias
  return (
    <div className="rel-rosca" role="img" aria-label={descricao}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={dados}
            dataKey="valor"
            nameKey="nome"
            innerRadius={cheia ? 0 : '64%'}
            outerRadius="100%"
            stroke="var(--superficie)"
            strokeWidth={2}
            startAngle={90}
            endAngle={-270}
            isAnimationActive={false}
          >
            {dados.map((f) => (
              <Cell key={f.chave} fill={f.cor} />
            ))}
          </Pie>
          {vazia ? null : (
            <Tooltip
              content={({ active, payload }) => {
                const f = payload?.[0]?.payload as Fatia | undefined
                return active && f ? <Dica linhas={[{ cor: f.cor, rotulo: f.nome, valor: formatar(f) }]} /> : null
              }}
            />
          )}
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

// ------------------------------------------------------------------------------ funil
export type NivelFunil = { nome: string; valor: number; cor: string }

export function Funil({ niveis, descricao }: { niveis: NivelFunil[]; descricao: string }) {
  // O funil do HTML tinha largura mínima: um nível com 0 ainda aparece como faixa estreita.
  const maior = Math.max(1, ...niveis.map((n) => n.valor))
  const dados = niveis.map((n) => ({ ...n, desenho: Math.max(n.valor, maior * 0.16), fill: n.cor }))
  return (
    <div className="rel-funil-grafico" role="img" aria-label={descricao}>
      <ResponsiveContainer width="100%" height="100%">
        <FunnelChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          <Tooltip
            content={({ active, payload }) => {
              const n = payload?.[0]?.payload as (NivelFunil & { desenho: number }) | undefined
              return active && n ? <Dica linhas={[{ cor: n.cor, rotulo: n.nome, valor: String(n.valor) }]} /> : null
            }}
          />
          <Funnel
            data={dados}
            dataKey="desenho"
            nameKey="nome"
            stroke="var(--superficie)"
            strokeWidth={2}
            lastShapeType="rectangle"
            isAnimationActive={false}
          >
            <LabelList
              dataKey="valor"
              position="center"
              fill="var(--graf-sobre)"
              stroke="none"
              fontSize={16}
              fontWeight={700}
            />
          </Funnel>
        </FunnelChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---------------------------------------------------------------- barras horizontais
export type Barra = { chave: string; nome: string; valor: number; cor?: string; dica?: string }

/**
 * Barras horizontais com o valor na ponta (HTML C: "Conversão por Vendedor" e "Cotações por
 * Vendedor"; aqui também os maiores de "Outros relatórios"). Uma série: sem legenda — o título
 * do cartão diz o que é.
 */
export function BarrasHorizontais({
  dados,
  descricao,
  formatar,
  maximo,
  larguraNome = 132,
}: {
  dados: Barra[]
  descricao: string
  formatar: (v: number) => string
  maximo?: number
  larguraNome?: number
}) {
  const altura = Math.max(120, dados.length * 34 + 28)
  return (
    <div className="rel-barras" role="img" aria-label={descricao} style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 64, bottom: 4, left: 4 }} barCategoryGap={8}>
          <CartesianGrid horizontal={false} stroke="var(--graf-grade)" />
          <XAxis
            type="number"
            domain={[0, maximo ?? 'auto']}
            tick={EIXO}
            tickFormatter={(v: number) => formatar(v)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="nome"
            width={larguraNome}
            tick={EIXO_NOME}
            // Uma linha só: nome longo quebrava e encavalava no vizinho. O nome inteiro está na dica.
            tickFormatter={(n: string) => cortar(n, Math.floor(larguraNome / 6.4))}
            axisLine={{ stroke: 'var(--graf-grade)' }}
            tickLine={false}
            interval={0}
          />
          <Tooltip
            cursor={{ fill: 'var(--graf-cursor)' }}
            content={({ active, payload }) => {
              const b = payload?.[0]?.payload as Barra | undefined
              return active && b ? (
                <Dica titulo={b.nome} linhas={[{ cor: b.cor ?? 'var(--graf-1)', rotulo: b.dica ?? 'Valor', valor: formatar(b.valor) }]} />
              ) : null
            }}
          />
          <Bar dataKey="valor" maxBarSize={22} radius={[0, 4, 4, 0]} isAnimationActive={false}>
            {dados.map((b) => (
              <Cell key={b.chave} fill={b.cor ?? 'var(--graf-1)'} />
            ))}
            <LabelList dataKey="valor" position="right" formatter={(v: unknown) => formatar(Number(v))} {...ROTULO} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ---------------------------------------------------------------- linha com área
export type Ponto = { rotulo: string; valor: number; dica?: string }

/** "Conversão ao Longo do Tempo" (HTML C): linha de 2px com área a 10%, rótulo só no último ponto. */
export function LinhaArea({
  dados,
  descricao,
  formatar,
  cor = 'var(--graf-conversao)',
}: {
  dados: Ponto[]
  descricao: string
  formatar: (v: number) => string
  cor?: string
}) {
  const ultimo = dados.length - 1
  return (
    <div className="rel-linha" role="img" aria-label={descricao}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={dados} margin={{ top: 22, right: 18, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--graf-grade)" />
          <XAxis dataKey="rotulo" tick={EIXO} axisLine={{ stroke: 'var(--graf-grade)' }} tickLine={false} />
          <YAxis
            tick={EIXO}
            tickFormatter={(v: number) => formatar(v)}
            axisLine={false}
            tickLine={false}
            width={44}
            domain={[0, (max: number) => Math.max(0.1, Math.min(1, max + 0.12))]}
          />
          <Tooltip
            cursor={{ stroke: 'var(--graf-eixo)', strokeWidth: 1 }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as Ponto | undefined
              return active && p ? <Dica titulo={p.rotulo} linhas={[{ cor, rotulo: p.dica ?? 'Valor', valor: formatar(p.valor) }]} /> : null
            }}
          />
          <Area
            type="monotone"
            dataKey="valor"
            stroke={cor}
            strokeWidth={2}
            fill={cor}
            fillOpacity={0.1}
            dot={{ r: 4, fill: cor, stroke: 'var(--superficie)', strokeWidth: 2 }}
            activeDot={{ r: 6, fill: cor, stroke: 'var(--superficie)', strokeWidth: 2 }}
            isAnimationActive={false}
          >
            <LabelList
              dataKey="valor"
              position="top"
              offset={10}
              content={(p) => {
                const { x, y, index, value } = p as { x?: number; y?: number; index?: number; value?: number }
                if (index !== ultimo || x === undefined || y === undefined) return null
                return (
                  <text x={x} y={y - 10} textAnchor="middle" {...ROTULO}>
                    {formatar(Number(value))}
                  </text>
                )
              }}
            />
          </Area>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

// ------------------------------------------------------------------------- colunas
/** Colunas verticais (HTML D "Volume diário"; aqui também "Total por mês"). */
export function Colunas({
  dados,
  descricao,
  formatar,
  altura = 220,
  rotularMaior = true,
}: {
  dados: Ponto[]
  descricao: string
  formatar: (v: number) => string
  altura?: number
  rotularMaior?: boolean
}) {
  // Rótulo só no maior valor. Compara pelo VALOR: o `index` que o LabelList da barra recebe não
  // bate com a posição no array (conferido na captura: caía na coluna seguinte).
  const maiorValor = Math.max(0, ...dados.map((d) => d.valor))
  return (
    <div className="rel-colunas-grafico" role="img" aria-label={descricao} style={{ height: altura }}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} margin={{ top: 22, right: 8, bottom: 0, left: 0 }} barCategoryGap="22%">
          <CartesianGrid vertical={false} stroke="var(--graf-grade)" />
          <XAxis dataKey="rotulo" tick={EIXO} axisLine={{ stroke: 'var(--graf-grade)' }} tickLine={false} interval={0} />
          <YAxis tick={EIXO} tickFormatter={(v: number) => formatar(v)} axisLine={false} tickLine={false} width={64} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: 'var(--graf-cursor)' }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as Ponto | undefined
              return active && p ? (
                <Dica titulo={p.dica ?? p.rotulo} linhas={[{ cor: 'var(--graf-1)', rotulo: 'Total', valor: formatar(p.valor) }]} />
              ) : null
            }}
          />
          <Bar dataKey="valor" fill="var(--graf-1)" maxBarSize={22} radius={[4, 4, 0, 0]} isAnimationActive={false}>
            {rotularMaior ? (
              <LabelList
                dataKey="valor"
                content={(p) => {
                  const { x, y, width, value } = p as { x?: number; y?: number; width?: number; value?: number }
                  if (Number(value) !== maiorValor || !value || x === undefined || y === undefined || width === undefined) return null
                  return (
                    <text x={x + width / 2} y={y - 8} textAnchor="middle" {...ROTULO}>
                      {formatar(Number(value))}
                    </text>
                  )
                }}
              />
            ) : null}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

// ------------------------------------------------------------------------------ anel
/** Anel de cobertura do HTML D (KPI "Cobertura"). */
export function Anel({ fracao, rotulo }: { fracao: number; rotulo: string }) {
  const r = 32
  const c = 2 * Math.PI * r
  const f = Math.max(0, Math.min(1, fracao))
  return (
    <svg className="rel-anel" viewBox="0 0 80 80" role="img" aria-label={`Cobertura ${rotulo}`}>
      <circle cx="40" cy="40" r={r} fill="none" stroke="var(--graf-trilho)" strokeWidth="9" />
      <circle
        cx="40"
        cy="40"
        r={r}
        fill="none"
        stroke="var(--graf-conversao)"
        strokeWidth="9"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - f)}
        transform="rotate(-90 40 40)"
      />
      <text x="40" y="45" textAnchor="middle" className="rel-anel-texto">
        {rotulo}
      </text>
    </svg>
  )
}
