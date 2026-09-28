/**
 * Núcleo do processador da fila, sem Supabase: o acesso ao banco entra por `RepositorioFila`
 * (implementação real em fila.ts). PURO, para o vitest provar as transições com um repositório
 * em memória.
 *
 * Garantias (junto com db/019):
 *   - Uma linha só é processada por quem a pegou (fn_email_pegar_lote: skip locked + lote_id).
 *   - O resultado só é gravado com o mesmo lote_id (`gravar` filtra por ele); quem perdeu a
 *     trava não sobrescreve.
 *   - Linha `enviado` nunca volta (trigger fn_email_outbox_guarda).
 *   - Repetição depois de queda usa a mesma chave de idempotência no provedor.
 */

import { decidirAposFalha, MAX_TENTATIVAS_PADRAO } from './backoff'
import { ErroEndereco, separarEnderecos } from './enderecos'
import type { AnexoPronto, MensagemPronta, Provedor } from './provedor'

/** As colunas de email_outbox que o worker usa. */
export interface LinhaFila {
  id: string
  lote_id: string
  tentativas: number
  para: string
  cc: string | null
  bcc: string | null
  assunto: string
  corpo: string
  responder_para: string | null
  remetente_nome: string | null
}

export interface AnexoFila {
  email_id: string
  nome_arquivo: string
  path: string
}

export type Gravacao =
  | { status: 'enviado' | 'registrado'; provedor: string; provedorId: string; agora: Date }
  | { status: 'pendente'; provedor: string; erro: string; proximoEnvioEm: Date }
  | { status: 'falhou'; provedor: string; erro: string }

export interface RepositorioFila {
  pegarLote(p: {
    limite: number
    travaSegundos: number
    maxTentativas: number
    ids: string[] | null
  }): Promise<LinhaFila[]>
  anexos(emailIds: string[]): Promise<AnexoFila[]>
  /** Grava só se a linha ainda estiver `enviando` com este lote_id. Devolve se gravou. */
  gravar(id: string, loteId: string, g: Gravacao): Promise<boolean>
}

export type LerAnexo = (path: string) => Promise<Uint8Array>

export interface OpcoesFila {
  repo: RepositorioFila
  provedor: Provedor
  lerAnexo: LerAnexo
  limite?: number
  travaSegundos?: number
  maxTentativas?: number
  ids?: string[] | null
  agora?: () => Date
  log?: (linha: string) => void
}

export interface ResumoFila {
  pegos: number
  enviados: number
  registrados: number
  reagendados: number
  falhos: number
  /** Resultado não gravado porque a trava foi perdida (outro lote já está com a linha). */
  perdidos: number
}

export function montarMensagem(linha: LinhaFila, anexos: AnexoPronto[]): MensagemPronta {
  return {
    id: linha.id,
    remetenteNome: linha.remetente_nome,
    para: separarEnderecos(linha.para),
    cc: separarEnderecos(linha.cc),
    bcc: separarEnderecos(linha.bcc),
    responderPara: separarEnderecos(linha.responder_para)[0] ?? null,
    assunto: linha.assunto,
    html: linha.corpo,
    anexos,
  }
}

export async function processarFilaCom(o: OpcoesFila): Promise<ResumoFila> {
  const agora = o.agora ?? (() => new Date())
  const log = o.log ?? console.log
  const maxTentativas = o.maxTentativas ?? MAX_TENTATIVAS_PADRAO
  const resumo: ResumoFila = {
    pegos: 0, enviados: 0, registrados: 0, reagendados: 0, falhos: 0, perdidos: 0,
  }

  const linhas = await o.repo.pegarLote({
    limite: o.limite ?? 10,
    travaSegundos: o.travaSegundos ?? 600,
    maxTentativas,
    ids: o.ids ?? null,
  })
  resumo.pegos = linhas.length
  if (!linhas.length) return resumo

  const anexos = await o.repo.anexos(linhas.map((l) => l.id))

  for (const linha of linhas) {
    let gravacao: Gravacao
    try {
      const prontos: AnexoPronto[] = []
      for (const a of anexos.filter((x) => x.email_id === linha.id)) {
        prontos.push({ nome: a.nome_arquivo, conteudo: await o.lerAnexo(a.path) })
      }
      const mensagem = montarMensagem(linha, prontos)
      const r = await o.provedor.enviar(mensagem)
      if (r.ok) {
        gravacao = {
          status: o.provedor.enviaDeVerdade ? 'enviado' : 'registrado',
          provedor: o.provedor.nome,
          provedorId: r.provedorId,
          agora: agora(),
        }
      } else {
        gravacao = falha(linha, r.erro, r.definitivo)
      }
    } catch (e) {
      // Endereço inválido na linha: definitivo (repetir não conserta). Anexo que não baixa ou
      // erro inesperado: transitório (o Storage pode voltar), dentro do limite de tentativas.
      gravacao = falha(linha, (e as Error).message, e instanceof ErroEndereco)
    }

    const gravou = await o.repo.gravar(linha.id, linha.lote_id, gravacao)
    if (!gravou) resumo.perdidos++
    else if (gravacao.status === 'enviado') resumo.enviados++
    else if (gravacao.status === 'registrado') resumo.registrados++
    else if (gravacao.status === 'pendente') resumo.reagendados++
    else resumo.falhos++

    log(JSON.stringify({
      evento: 'email.fila', id: linha.id, tentativa: linha.tentativas,
      resultado: gravou ? gravacao.status : 'trava_perdida',
    }))
  }
  return resumo

  function falha(linha: LinhaFila, erro: string, definitivo: boolean): Gravacao {
    const d = decidirAposFalha({ tentativas: linha.tentativas, maxTentativas, definitivo, agora: agora() })
    const texto = erro.slice(0, 500)
    return d.status === 'falhou'
      ? { status: 'falhou', provedor: o.provedor.nome, erro: texto }
      : { status: 'pendente', provedor: o.provedor.nome, erro: texto, proximoEnvioEm: d.proximoEnvioEm }
  }
}
