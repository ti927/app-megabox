# Envio de e-mail — decisões (db/019, lib/email, app/api/fila-email)

No Bubble o envio é SMTP do Gmail com a senha de app em texto puro em `Opt.Smtp.GmailMegabox`
(`00-achados-de-seguranca.md` §1.1), chamado no meio do workflow (`EnviarEmailPedido` bTjOx0,
`EnviarEmailsGeral` bTnvb0). O app novo usa **fila + worker + provedor transacional por API (Resend)**.

## Fluxo

1. A server action valida sessão e permissão, tira os destinatários **do banco** e chama
   `enfileirarEmail(...)` (`lib/email/enfileirar.ts`). Isso monta o e-mail (modelo de `modelos_email`
   ou HTML já seguro), soma as cópias de `config_copia_email` do evento e grava mensagem + anexos
   numa transação só (`fn_email_enfileirar`). Não envia.
2. O Vercel Cron chama `GET /api/fila-email` a cada 5 min (`vercel.json`). A rota exige
   `Authorization: Bearer <FILA_EMAIL_SEGREDO>` (comparação em tempo constante; sem segredo ou com
   segredo curto → 503, falha fechada) e chama `processarFila()`.
3. `fn_email_pegar_lote` pega até 10 linhas vencidas com `for update skip locked`, marca `enviando`
   + `lote_id` + `travado_ate` (10 min) + tentativa. O envio HTTP acontece fora da transação.
4. O resultado só é gravado se a linha ainda estiver `enviando` com o mesmo `lote_id`.

## Estados

`pendente → enviando → enviado | registrado | falhou` (`cancelado`, manual).

- `registrado`: processado pelo provedor `registro` (`EMAIL_MODO` ≠ `envio`): logado **sem corpo nem
  endereços**, **não** enviado. Pode voltar a `pendente` quando o envio for ligado.
- `enviado` é final (trigger `fn_email_outbox_guarda`), e `enviado ⇔ enviado_em` (CHECK).
- Conteúdo congelado depois da 1ª tentativa (a chave de idempotência é o id da linha).
- Backoff: 1 min, 5 min, 15 min, 1 h, 6 h; limite de 5 tentativas. 4xx do Resend (menos 409/429) e
  endereço inválido falham de vez; 409, 429, 5xx, rede e anexo que não baixa são reagendados.

## Envio duplo

Três camadas: (1) `skip locked` + recheck do WHERE → duas chamadas não pegam a mesma linha;
(2) gravação condicionada ao `lote_id` → quem perdeu a trava não grava; (3) `Idempotency-Key:
email_outbox/<id>` no Resend → se o worker morrer depois do aceite e antes de gravar, a repetição
(após a trava vencer) não gera segundo e-mail (janela de 24 h do Resend).

## Relay aberto

`authenticated` não insere na fila (GRANT revogado na 008 D7) e não executa `fn_email_enfileirar`
nem `fn_email_pegar_lote` (execute só `service_role`). Quem enfileira é código de servidor; o
destinatário vem do banco; máx. 50 destinatários; CR/LF removidos de assunto e nome do remetente;
variáveis escapadas no corpo HTML.

## Variáveis de ambiente

| Nome | Quem preenche | Observação |
|---|---|---|
| `EMAIL_MODO` | dono | `envio` liga o Resend; qualquer outro valor = `registro` (padrão) |
| `RESEND_API_KEY` | dono | só servidor |
| `EMAIL_REMETENTE` | dono | endereço em domínio verificado no Resend (SPF/DKIM) |
| `FILA_EMAIL_SEGREDO` | gerado | ≥ 32 caracteres aleatórios |
| `CRON_SECRET` (Vercel) | dono | **mesmo valor** de `FILA_EMAIL_SEGREDO` (o Cron manda esse) |

## [DÚVIDA]s

- **Plano da Vercel.** Cron a cada 5 min exige Pro; no Hobby, cron mais frequente que diário falha
  o deploy. *Recomendação:* Pro. Alternativa: agendar pelo `pg_cron` + `pg_net` chamando a rota.
- **Cota diária** (`ConfigSistema[19]`, casca [DÚVIDA 9]): não há bloqueio; `count(*)` de
  `email_outbox where enviado_em >= hoje` substitui o contador. Alerta de cota fica para depois.
- **Anexos:** `email_anexos.path` = `<bucket>/<objeto>` até `lib/arquivos.ts` existir
  (ponto de integração em `lib/email/anexos.ts`).
