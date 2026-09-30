'use client'

import { ExternalLink, Plus, Trash2 } from 'lucide-react'
import { startTransition, useActionState, useEffect, useState } from 'react'

import { formatarTamanho } from '@/lib/anexos'
import { aceitos, conferirEnvio } from '@/lib/arquivos-envio'
import { formatarData } from '@/lib/datas'

import { abrirAnexo, enviarAnexoGrupo, removerAnexo } from './acoes-anexos'
import { Retorno } from './filiais-contatos'
import type { Anexo, EstadoItem, Ficha, Opcoes } from './tipos'

/*
 * Aba "Anexos" da ficha — porta do `pop.AnexosClifor` (bTjcT) no modo Cliente/Fornecedor,
 * specs/paginas/cadastros.md §3.6 e §4.6.
 *
 * - A lista já chega filtrada pela RLS: tipo que o departamento não vê não aparece (018 §4).
 * - Abrir gera a URL assinada no SERVIDOR na hora do clique (60 s), nunca antes.
 * - Apagar é UM por vez, com confirmação, só Diretor/Gerente (bTjdn). O "apagar todos" do
 *   cabeçalho (bTjeL) não existe.
 */

const ACEITOS = aceitos('anexos')

function LinhaAnexo({ anexo, podeApagar }: { anexo: Anexo; podeApagar: boolean }) {
  const [abrindo, setAbrindo] = useState(false)
  const [erro, setErro] = useState<string | null>(null)
  const [estado, apagar, apagando] = useActionState(removerAnexo, {})

  async function abrir() {
    setErro(null)
    setAbrindo(true)
    // A aba abre JÁ, dentro do clique: aberta depois do `await`, o bloqueador de pop-up a
    // barraria. Ela recebe o endereço quando a URL assinada chega.
    const aba = window.open('', '_blank')
    try {
      const r = await abrirAnexo(anexo.id)
      if ('url' in r) {
        if (aba) {
          aba.opener = null
          aba.location.href = r.url
        } else {
          window.location.assign(r.url)
        }
      } else {
        aba?.close()
        setErro(r.erro)
      }
    } catch {
      aba?.close()
      setErro('Não foi possível abrir agora. Tente de novo.')
    } finally {
      setAbrindo(false)
    }
  }

  const tamanho = formatarTamanho(anexo.tamanho_bytes)

  return (
    <li className="ficha-item" data-teste="item-anexo">
      <div className="ficha-item-topo">
        <span className="selo">{anexo.tipo?.nome ?? 'Sem tipo'}</span>
        <strong className="anexo-nome">{anexo.nome_arquivo}</strong>
        <div className="ficha-item-acoes">
          <button
            type="button"
            className="link"
            onClick={abrir}
            disabled={abrindo}
            aria-busy={abrindo}
            data-teste="abrir-anexo"
          >
            <ExternalLink size={16} aria-hidden="true" />
            {abrindo ? 'Abrindo…' : 'Abrir'}
          </button>
          {podeApagar ? (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (!window.confirm(`Apagar o documento "${anexo.nome_arquivo}"? Não dá para desfazer.`)) return
                const form = new FormData(e.currentTarget)
                startTransition(() => apagar(form))
              }}
            >
              <input type="hidden" name="id" value={anexo.id} />
              <button type="submit" className="link anexo-apagar" disabled={apagando} data-teste="apagar-anexo">
                <Trash2 size={16} aria-hidden="true" />
                {apagando ? 'Apagando…' : 'Apagar'}
              </button>
            </form>
          ) : null}
        </div>
      </div>
      <p className="ficha-dica">
        {anexo.filial ? `${anexo.filial.nome_endereco} · ` : ''}
        Enviado em {formatarData(anexo.criado_em)}
        {anexo.autor ? ` por ${anexo.autor.nome}` : ''}
        {tamanho ? ` · ${tamanho}` : ''}
      </p>
      {erro ? (
        <p className="aviso" data-tom="erro" role="alert">
          {erro}
        </p>
      ) : null}
      <Retorno estado={estado} teste="apagar-anexo" />
    </li>
  )
}

function FormularioAnexo({
  ficha,
  opcoes,
  aoFechar,
}: {
  ficha: Ficha
  opcoes: Opcoes
  /** volta à lista; com o retorno do envio quando ele deu certo */
  aoFechar: (retorno?: EstadoItem) => void
}) {
  const [estado, enviar, enviando] = useActionState(enviarAnexoGrupo, {})
  const [erroLocal, setErroLocal] = useState<string | null>(null)
  const ativas = ficha.filiais.filter((f) => f.ativo)

  // Enviou: volta à lista (a revalidação já trouxe o documento novo) levando a mensagem.
  useEffect(() => {
    if (estado.ok) aoFechar(estado)
    // aoFechar muda de identidade a cada render do pai; o gatilho é só o retorno novo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [estado])

  const mostrado: EstadoItem = erroLocal ? { erro: erroLocal } : estado

  return (
    <form
      className="ficha-form"
      noValidate
      data-teste="form-anexo"
      onSubmit={(e) => {
        e.preventDefault()
        const dados = new FormData(e.currentTarget)
        const arquivo = dados.get('arquivo')
        // Mesma regra do servidor e do bucket, antes de gastar um envio.
        if (!dados.get('tipo_anexo_id')) return setErroLocal('Escolha o tipo do documento.')
        if (ativas.length > 0 && !dados.get('endereco_id')) return setErroLocal('Escolha a filial do documento.')
        if (!(arquivo instanceof File) || arquivo.size === 0) return setErroLocal('Escolha o arquivo.')
        const v = conferirEnvio('anexos', { nome: arquivo.name, tipo: arquivo.type, tamanho: arquivo.size })
        if (!v.ok) return setErroLocal(v.erro)
        setErroLocal(null)
        startTransition(() => enviar(dados))
      }}
    >
      <h3 className="ficha-subtitulo">Novo documento</h3>
      <input type="hidden" name="grupo_id" value={ficha.grupo.id} />
      <fieldset className="ficha-campos" disabled={enviando}>
        <label className="campo">
          <span>Tipo do documento</span>
          <select name="tipo_anexo_id" required defaultValue="" data-teste="tipo-anexo">
            <option value="" disabled>
              Escolha…
            </option>
            {opcoes.tiposAnexo.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nome}
              </option>
            ))}
          </select>
        </label>
        {ativas.length > 0 ? (
          <label className="campo">
            <span>Filial</span>
            <select
              name="endereco_id"
              required
              defaultValue={ativas.length === 1 ? ativas[0]!.id : ''}
              data-teste="filial-anexo"
            >
              <option value="" disabled>
                Escolha…
              </option>
              {ativas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.nome_endereco}
                  {f.municipio ? ` — ${f.municipio}/${f.uf}` : ` — ${f.uf}`}
                </option>
              ))}
            </select>
          </label>
        ) : (
          <p className="ficha-dica">Sem filial ativa: o documento fica no cadastro do grupo.</p>
        )}
        <label className="campo ficha-largo">
          <span>Arquivo</span>
          <input type="file" name="arquivo" required accept={ACEITOS} data-teste="arquivo-anexo" />
          <small className="ficha-dica">PDF, imagem (JPG, PNG, WEBP), Word ou Excel.</small>
        </label>
      </fieldset>
      <Retorno estado={mostrado} teste="enviar-anexo" />
      <div className="ficha-form-acoes">
        <button type="button" className="botao-secundario" onClick={() => aoFechar()} disabled={enviando}>
          Voltar
        </button>
        <button
          type="submit"
          className="botao-primario"
          disabled={enviando}
          aria-busy={enviando}
          data-teste="enviar-anexo"
        >
          {enviando ? 'Enviando…' : 'Anexar'}
        </button>
      </div>
    </form>
  )
}

export function AbaAnexos({
  ficha,
  opcoes,
  podeApagar,
}: {
  ficha: Ficha
  opcoes: Opcoes
  podeApagar: boolean
}) {
  const [novo, setNovo] = useState(false)
  const [retorno, setRetorno] = useState<EstadoItem>({})

  if (novo) {
    return (
      <FormularioAnexo
        ficha={ficha}
        opcoes={opcoes}
        aoFechar={(r) => {
          setRetorno(r ?? {})
          setNovo(false)
        }}
      />
    )
  }

  return (
    <>
      <div className="ficha-secao-topo">
        <span>Documentos do {ficha.grupo.tipo === 'cliente' ? 'cliente' : 'fornecedor'}</span>
        <button
          type="button"
          className="botao-primario"
          onClick={() => {
            setRetorno({})
            setNovo(true)
          }}
          data-teste="novo-anexo"
        >
          <Plus size={16} aria-hidden="true" />
          Anexar documento
        </button>
      </div>
      <Retorno estado={retorno} teste="lista-anexo" />
      {ficha.anexos.length === 0 ? (
        <p className="ficha-vazio" data-teste="anexos-vazio">
          Nenhum documento que o seu departamento possa ver.
        </p>
      ) : (
        <ul className="ficha-itens" data-teste="lista-anexos">
          {ficha.anexos.map((a) => (
            <LinhaAnexo key={a.id} anexo={a} podeApagar={podeApagar} />
          ))}
        </ul>
      )}
    </>
  )
}
