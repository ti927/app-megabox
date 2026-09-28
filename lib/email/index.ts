import 'server-only'

/**
 * Envio de e-mail (db/019). SÓ SERVIDOR.
 *
 *   enfileirarEmail(...)  — server action enfileira (valida sessão e tira destinatários do banco antes)
 *   processarFila(...)    — app/api/fila-email (cron) envia
 *
 * Modo por EMAIL_MODO: `envio` → Resend; qualquer outro → `registro` (não envia).
 */
export { enfileirarEmail, copiasDoEvento, type PedidoDeEmail, type EventoCopia } from './enfileirar'
export { processarFila, type ExecucaoFila } from './fila'
export { textoParaHtml, escaparHtml, type Variaveis } from './modelo'
