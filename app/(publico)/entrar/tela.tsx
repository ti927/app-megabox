'use client'

import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'

import { Marca } from '@/componentes/marca'

import { entrar, type EstadoEntrar } from './acoes'

function Botao() {
  const { pending } = useFormStatus()
  return (
    <button type="submit" className="botao-primario" disabled={pending}>
      {pending ? 'Entrando…' : 'Entrar'}
    </button>
  )
}

export function TelaEntrar({ proximo }: { proximo: string }) {
  const [estado, acao] = useActionState<EstadoEntrar, FormData>(entrar, {})

  return (
    <main className="entrar">
      {/* Bubble (index): logo grande centralizado, cartão de login logo abaixo. */}
      <Marca className="entrar-marca" tamanho={44} />
      <form action={acao} className="entrar-cartao" noValidate>
        <h1 className="entrar-titulo">Bem-vindo de volta</h1>
        <p className="entrar-sub">Entre com seu e-mail e senha para continuar.</p>

        <input type="hidden" name="proximo" value={proximo} />

        <label className="campo">
          <span>E-mail</span>
          <input
            name="email"
            type="email"
            autoComplete="username"
            required
            autoFocus
            spellCheck={false}
          />
        </label>

        <label className="campo">
          <span>Senha</span>
          <input name="senha" type="password" autoComplete="current-password" required />
        </label>

        {estado.erro ? (
          <p className="entrar-erro" role="alert" data-teste="erro-login">
            {estado.erro}
          </p>
        ) : null}

        <Botao />
      </form>
    </main>
  )
}
