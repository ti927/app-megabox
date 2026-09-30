import { ArrowRight } from 'lucide-react'
import type { Metadata, Route } from 'next'
import Link from 'next/link'

import { Icone } from '@/componentes/icone'
import { iconePagina } from '@/componentes/icones-paginas'
import { exigirAcesso, minhasPaginas } from '@/lib/autorizacao'
import { formatarReais } from '@/lib/dinheiro'
import { colunasDoPeriodo, type LinhaInicio, lerPeriodo, montarMatrizInicio } from '@/lib/inicio'
import { hojeSaoPaulo } from '@/lib/relatorios'
import { clienteServidor } from '@/lib/supabase/servidor'

import { FiltroPeriodo } from './filtro'

import './inicio.css'

export const metadata: Metadata = { title: 'Início — MegaBox' }

/**
 * Painel inicial. No Bubble (inicio-e-acesso.md §1.2/§2.2) o único bloco visível é a matriz de
 * comissões Fornecedor × 12 meses (`gp ajuste enderecos` bTisF, `Table B` bUAxV) com o filtro
 * "Intervalo datas". A matriz vem pronta do banco (`fn_inicio_comissoes_fornecedor_mes`, 025),
 * pelo cliente da SESSÃO: a RLS de entregas decide o que entra. Os atalhos para as páginas
 * liberadas ficam numa faixa compacta acima dela.
 */
export default async function PaginaInicio({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  // Trava no servidor, junto da consulta. Digitar a URL não basta.
  await exigirAcesso('inicio')
  const hoje = hojeSaoPaulo()
  const { periodo, aviso } = lerPeriodo(await searchParams, hoje)

  const supabase = await clienteServidor()
  const [paginas, resposta] = await Promise.all([
    minhasPaginas(),
    supabase.rpc('fn_inicio_comissoes_fornecedor_mes', { p_inicio: periodo.de, p_fim: periodo.ate }),
  ])
  if (resposta.error) console.error('inicio: matriz', { code: resposta.error.code, message: resposta.error.message })
  const atalhos = paginas.filter((p) => p.slug !== 'inicio')
  const matriz = montarMatrizInicio((resposta.data ?? []) as LinhaInicio[])
  const colunas = colunasDoPeriodo(periodo)

  return (
    <div className="inicio">
      {atalhos.length > 0 ? (
        <nav aria-label="Atalhos" className="inicio-atalhos-faixa">
          <ul className="inicio-atalhos">
            {atalhos.map((p) => (
              <li key={p.slug}>
                <Link href={`/${p.slug}` as Route} className="inicio-atalho">
                  <Icone icone={iconePagina(p.slug)} tamanho={18} className="inicio-atalho-icone" />
                  <span>{p.nome}</span>
                  <Icone icone={ArrowRight} tamanho={16} className="inicio-atalho-seta" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}

      <section className="inicio-painel" aria-labelledby="inicio-matriz-t">
        <div className="inicio-painel-topo">
          <div>
            <h1 id="inicio-matriz-t">Comissões por fornecedor</h1>
            <p className="inicio-sub">Entregas na etapa Financeiro, pela data da entrega.</p>
          </div>
          <FiltroPeriodo de={periodo.de} ate={periodo.ate} />
        </div>

        {aviso ? <p className="aviso">{aviso}</p> : null}
        {resposta.error ? (
          <p className="aviso" data-tom="erro">
            Não foi possível carregar a matriz agora. Tente de novo em instantes.
          </p>
        ) : null}

        <div className="inicio-rolagem">
          <table className="inicio-matriz" data-teste="inicio-conteudo">
            <thead>
              <tr>
                <th scope="col">Fornecedor</th>
                {colunas.map((c) => (
                  <th key={c.mes} scope="col" className="valor">
                    {c.rotulo}
                  </th>
                ))}
                <th scope="col" className="valor">
                  Total
                </th>
              </tr>
            </thead>
            <tbody>
              {matriz.linhas.length === 0 ? (
                <tr>
                  <td colSpan={colunas.length + 2} className="inicio-vazio">
                    Nenhuma entrega em Financeiro no período.
                  </td>
                </tr>
              ) : (
                matriz.linhas.map((l) => (
                  <tr key={l.id}>
                    <th scope="row" title={l.fornecedor}>
                      {l.fornecedor}
                    </th>
                    {colunas.map((c) => (
                      <td key={c.mes} className="valor">
                        {l.celulas[c.mes] ? formatarReais(l.celulas[c.mes]) : ''}
                      </td>
                    ))}
                    <td className="valor inicio-total-linha">{formatarReais(l.total)}</td>
                  </tr>
                ))
              )}
            </tbody>
            {matriz.totalGeral !== null ? (
              <tfoot>
                <tr>
                  <th scope="row">Total</th>
                  {colunas.map((c) => (
                    <td key={c.mes} className="valor">
                      {matriz.totaisMes[c.mes] ? formatarReais(matriz.totaisMes[c.mes]) : ''}
                    </td>
                  ))}
                  <td className="valor">{formatarReais(matriz.totalGeral)}</td>
                </tr>
              </tfoot>
            ) : null}
          </table>
        </div>
      </section>
    </div>
  )
}
