'use client'

import {
  Award,
  BarChart3,
  Briefcase,
  Calendar,
  ChartLine,
  Send,
  SlidersHorizontal,
  Target,
  Trophy,
  UserCheck,
  UserRound,
  Users,
} from 'lucide-react'

import {
  anosDisponiveis,
  destaquesProspeccao,
  faixaCobertura,
  iniciais,
  MESES_NOME,
  type PainelProspeccao,
  percentualInteiro,
  picoDiario,
  umaCasa,
  type VendedorProspeccao,
} from '@/lib/relatorios-paineis'

import { Foto } from '@/componentes/foto'

import { Anel, Colunas } from './graficos'
import { CabecalhoRelatorio, Kpi, Vazio } from './pecas'
import type { Vendedor } from './tipos'

export type FiltroProspeccao = { ano: number; mes: number; vendedor: string | null }

/** Cor do avatar por posição no ranking (os gradientes do HTML D viram tons dos tokens). */
const TOM_AVATAR = ['ouro', 'prata', 'roxo', 'azul', 'ciano', 'verde'] as const

function Destaque({
  tom,
  Icone,
  categoria,
  quem,
  foto,
  meta,
  valor,
  unidade,
}: {
  tom: 'ouro' | 'azul' | 'roxo'
  Icone: typeof Trophy
  categoria: string
  quem: VendedorProspeccao | null
  foto: string | undefined
  meta: string
  valor: string
  unidade: string
}) {
  return (
    <div className="rel-vencedor" data-tom={tom}>
      <span className="rel-vencedor-cat">
        <Icone size={14} aria-hidden /> {categoria}
      </span>
      <div className="rel-vencedor-pessoa">
        {quem ? (
          <Foto url={foto} nome={quem.nome} className="rel-avatar rel-avatar-g" tom={tom} iniciais={iniciais(quem.nome)} />
        ) : (
          <span className="rel-avatar rel-avatar-g" data-tom={tom} aria-hidden>
            —
          </span>
        )}
        <div>
          <b>{quem?.nome ?? '—'}</b>
          <small>{meta}</small>
        </div>
      </div>
      <p className="rel-vencedor-valor">
        {valor}
        <small> {unidade}</small>
      </p>
    </div>
  )
}

export function AbaProspeccao({
  painel,
  fotos,
  filtro,
  anoCorrente,
  vendedores,
  veTodos,
  geradoEm,
  pendente,
  aoAplicar,
  aoAtualizar,
}: {
  painel: PainelProspeccao | null
  fotos: Record<string, string>
  filtro: FiltroProspeccao
  anoCorrente: number
  vendedores: Vendedor[]
  veTodos: boolean
  geradoEm: string
  pendente: boolean
  aoAplicar: (f: FiltroProspeccao) => void
  aoAtualizar: () => void
}) {
  const linhas = painel?.vendedores ?? []
  const t = painel?.totais
  const uteis = painel?.dias_uteis ?? 0
  const diario = painel?.diario ?? []
  const d = destaquesProspeccao(linhas)
  const pico = picoDiario(diario)
  const comDestaques = !filtro.vendedor
  const mesNome = MESES_NOME[filtro.mes - 1]

  return (
    <div className="rel-painel">
      <CabecalhoRelatorio
        Icone={Target}
        titulo="Relatório de Prospecção"
        subtitulo="Propostas e clientes da carteira — por vendedor"
        geradoEm={geradoEm}
        atualizando={pendente}
        aoAtualizar={aoAtualizar}
      />

      {/* O HTML D recalcula ao trocar o select, sem botão de aplicar. */}
      <div className="rel-filtros-cartao" role="group" aria-label="Filtros do relatório de prospecção">
        <span className="rel-filtros-marca" aria-hidden>
          <SlidersHorizontal size={17} />
          Filtros
        </span>
        <label className="campo rel-campo">
          <span>
            <Calendar size={12} aria-hidden /> Mês
          </span>
          <select value={filtro.mes} disabled={pendente} onChange={(e) => aoAplicar({ ...filtro, mes: Number(e.target.value) })}>
            {MESES_NOME.map((n, i) => (
              <option key={n} value={i + 1}>
                {n}
              </option>
            ))}
          </select>
        </label>
        <label className="campo rel-campo">
          <span>
            <Calendar size={12} aria-hidden /> Ano
          </span>
          <select value={filtro.ano} disabled={pendente} onChange={(e) => aoAplicar({ ...filtro, ano: Number(e.target.value) })}>
            {anosDisponiveis(anoCorrente, anoCorrente - 3).map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
        </label>
        {veTodos ? (
          <label className="campo rel-campo rel-campo-largo">
            <span>
              <UserRound size={12} aria-hidden /> Vendedor
            </span>
            <select
              value={filtro.vendedor ?? ''}
              disabled={pendente}
              onChange={(e) => aoAplicar({ ...filtro, vendedor: e.target.value || null })}
            >
              <option value="">Todos</option>
              {vendedores.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.nome}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <div className="rel-kpis rel-kpis-5">
        <Kpi Icone={Send} rotulo="Enviadas" valor={t?.enviadas ?? 0} apoio="Propostas no mês" />
        <Kpi Icone={UserCheck} tom="verde" rotulo="Clientes" valor={t?.clientes ?? 0} apoio="Da carteira, prospectados" />
        <Kpi Icone={Briefcase} tom="laranja" rotulo="Carteira" valor={t?.carteira ?? 0} apoio="Clientes na carteira" />
        <Kpi Icone={ChartLine} tom="vermelho" rotulo="Média/dia" valor={umaCasa(t?.media_dia ?? 0)} apoio="Propostas por dia útil" />
        <Kpi Icone={Target} tom="roxo" rotulo="Cobertura">
          <span className="rel-anel-linha">
            <Anel fracao={t?.cobertura ?? 0} rotulo={percentualInteiro(t?.cobertura ?? 0)} />
            <small>
              Da carteira
              <br />
              prospectada
            </small>
          </span>
        </Kpi>
      </div>

      {comDestaques ? (
        <section className="rel-bloco-titulado" aria-labelledby="rel-dest-t">
          <p className="rel-sobretitulo">
            <Trophy size={14} aria-hidden /> Indicadores de performance
          </p>
          <h3 id="rel-dest-t">Destaques do mês</h3>
          <div className="rel-grade-3">
            <Destaque
              tom="ouro"
              Icone={Trophy}
              categoria="Mais propostas enviadas"
              quem={d.enviadas}
              foto={d.enviadas ? fotos[d.enviadas.vendedor_id] : undefined}
              meta={d.enviadas ? `${umaCasa(d.enviadas.media_dia)} por dia útil` : ''}
              valor={d.enviadas ? String(d.enviadas.enviadas) : '—'}
              unidade="enviadas"
            />
            <Destaque
              tom="azul"
              Icone={Users}
              categoria="Mais clientes prospectados"
              quem={d.clientes}
              foto={d.clientes ? fotos[d.clientes.vendedor_id] : undefined}
              meta={d.clientes ? `de ${d.clientes.carteira} na carteira` : ''}
              valor={d.clientes ? String(d.clientes.clientes) : '—'}
              unidade="clientes"
            />
            <Destaque
              tom="roxo"
              Icone={Target}
              categoria="Melhor cobertura"
              quem={d.cobertura}
              foto={d.cobertura ? fotos[d.cobertura.vendedor_id] : undefined}
              meta={d.cobertura ? `${d.cobertura.clientes} de ${d.cobertura.carteira} clientes` : ''}
              valor={d.cobertura ? String(Math.round(d.cobertura.cobertura * 100)) : '—'}
              unidade="%"
            />
          </div>
        </section>
      ) : null}

      <section className="rel-bloco-titulado" aria-labelledby="rel-rank-t">
        <p className="rel-sobretitulo">
          <Award size={14} aria-hidden /> Ranking de prospecção
        </p>
        <h3 id="rel-rank-t">Propostas e clientes da carteira — por vendedor</h3>
        <div className="rel-painel-cartao">
          {linhas.length === 0 ? (
            <Vazio Icone={Send} texto="Nenhuma proposta enviada neste período." />
          ) : (
            <div className="rel-rolagem">
              <table className="rel-ranking-prosp">
                <thead>
                  <tr>
                    <th scope="col">#</th>
                    <th scope="col">Vendedor</th>
                    <th scope="col" className="valor">Propostas</th>
                    <th scope="col" className="valor">Clientes</th>
                    <th scope="col" className="valor">Carteira</th>
                    <th scope="col">Cobertura</th>
                    <th scope="col" className="valor">Média/dia</th>
                  </tr>
                </thead>
                <tbody>
                  {linhas.map((v, i) => {
                    const faixa = faixaCobertura(v.cobertura)
                    return (
                      <tr key={v.vendedor_id} title={`Cobertura por propostas: ${percentualInteiro(v.cobertura_propostas)}`}>
                        <td>
                          <span className="rel-posicao" data-podio={i < 3 ? i + 1 : undefined}>
                            {i + 1}
                          </span>
                        </td>
                        <th scope="row">
                          <span className="rel-quem">
                            <Foto
                              url={fotos[v.vendedor_id]}
                              nome={v.nome}
                              className="rel-avatar"
                              tom={TOM_AVATAR[i % TOM_AVATAR.length]}
                              iniciais={iniciais(v.nome)}
                            />
                            {v.nome}
                          </span>
                        </th>
                        <td className="valor rel-num-forte">{v.enviadas}</td>
                        <td className="valor rel-num-forte rel-num-verde">{v.clientes}</td>
                        <td className="valor rel-num-medio">{v.carteira}</td>
                        <td>
                          <span className="rel-cobertura">
                            <span
                              className="rel-cobertura-barra"
                              role="meter"
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={Math.round(v.cobertura * 100)}
                              aria-label={`Cobertura de ${v.nome}`}
                            >
                              <i data-faixa={faixa} style={{ width: `${Math.min(100, Math.round(v.cobertura * 100))}%` }} />
                            </span>
                            <b>{percentualInteiro(v.cobertura)}</b>
                          </span>
                        </td>
                        <td className="valor rel-num-mono">{umaCasa(v.media_dia)}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <section className="rel-bloco-titulado" aria-labelledby="rel-dia-t">
        <p className="rel-sobretitulo">
          <BarChart3 size={14} aria-hidden /> Volume diário
        </p>
        <h3 id="rel-dia-t">
          Propostas enviadas por dia — {mesNome} {filtro.ano}
        </h3>
        <div className="rel-painel-cartao rel-painel-grafico">
          <Colunas
            altura={240}
            rotularMaior={!!pico}
            descricao={`Propostas enviadas por dia útil em ${mesNome} de ${filtro.ano}`}
            formatar={(v) => String(Math.round(v))}
            dados={diario.map((x) => ({
              rotulo: x.dia.slice(8, 10),
              valor: x.propostas,
              dica: `Dia ${x.dia.slice(8, 10)}/${x.dia.slice(5, 7)}`,
            }))}
          />
          <p className="rel-rodape-colunas">
            <span>
              {pico ? (
                <>
                  Pico: <b>dia {pico.dia.slice(8, 10)}</b> · {pico.propostas} propostas
                </>
              ) : (
                'Sem dados no período'
              )}
            </span>
            <span>
              Média: <b>{umaCasa(t?.media_dia ?? 0)}/dia</b> · {uteis} dias úteis
            </span>
          </p>
        </div>
      </section>
    </div>
  )
}
