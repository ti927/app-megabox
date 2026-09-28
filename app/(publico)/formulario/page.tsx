import { notFound } from 'next/navigation'

/** `/formulario` sem token: o mesmo "link inválido" de qualquer outro caso. */
export default function FormularioSemToken() {
  notFound()
}
