import { AvisoPesquisa } from './aviso'

/**
 * Link inválido: token malformado, inexistente, de convite cancelado ou de campanha
 * desativada. UMA mensagem para todos, com status 404 — a página não confirma que um
 * convite existe (db/013; formularios-publicos §7.4.4).
 */
export default function LinkInvalido() {
  return <AvisoPesquisa resultado="invalido" />
}
