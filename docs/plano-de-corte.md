# Plano de corte — checklist executável

Operacionaliza `specs/03-plano-de-construcao.md` §8 com o que foi de fato construído (atualizado em
29/09/2026). A ordem importa: o que sair de ordem custa dado ou custa acesso. Cada passo tem **quem**
faz — **D** = dono do projeto (painel, contas, decisão), **C** = Claude (comando no repositório).

---

## A. Antes do dia do corte (sem esperar por ele)

| # | Passo | Quem | Como confirmar |
|---|---|---|---|
| A1 | **Supabase de Micro para Small** (a Micro caiu em 28/09 com carga de testes) | D | painel → Settings → Compute |
| A2 | **Projeto `app-megabox` na Vercel, equipe Lure TI's projects**, ligado a `ti927/app-megabox`, região `gru1` | D (permissão) + C | deploy de preview abre `/entrar` |
| A3 | **Variáveis de ambiente na Vercel** (produção e preview): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `PESQUISA_IP_SEGREDO`, `FILA_EMAIL_SEGREDO`, `CRON_SECRET` (= `FILA_EMAIL_SEGREDO`), `EMAIL_MODO=registro`. Nunca `DATABASE_URL` nem `BUBBLE_*` (só servem às ferramentas locais) | C, via `vercel env add` lendo o `.env` | `vercel env ls` |
| A4 | **Plano Pro na Vercel** → voltar o cron da fila para `*/5 * * * *` em `vercel.json` (hoje está diário para caber no Hobby) | D + C | cron listado no projeto |
| A5 | **Resend**: conta, domínio da MegaBox verificado (SPF/DKIM), `RESEND_API_KEY` e `EMAIL_REMETENTE` na Vercel. `EMAIL_MODO` continua `registro` até o A6 | D | `node scripts/testar-fila-email.mjs` |
| A6 | **Rotacionar a senha de app do Gmail** (`specs/00` §1.1) e só então `EMAIL_MODO=envio`. Até aqui o app só registra, não envia | D | um e-mail real de teste para a própria caixa |
| A7 | Rotacionar refresh token/client secret do Google e a chave do App Connector `GestaoLure` (`00` §1.3, §1.4); fechar no Bubble o workflow `VicularOcamentoCopiaAoProdutoCopia` (`00` §2.1) | D | — |
| A8 | **Proteção contra senha vazada** no Supabase Auth (Authentication → Policies) — `specs/05` §4 | D | `get_advisors` sem o WARN |
| A9 | **Decisões de negócio** pendentes em `specs/04-duvidas.md` (B1–B4, equipe financeira, status que conta como venda, fórmulas de Cotação/Prospecção, leitura do SAC, anexos de usuário) | D | cada [DÚVIDA] respondida ou aceita a recomendação padrão |
| A10 | **Homologação** com 2–3 usuários reais em preview: um dia de trabalho normal em cada módulo | D | lista de ajustes fechada |

## B. O dia do corte

| # | Passo | Quem | Comando / ação |
|---|---|---|---|
| B1 | Comunicado e horário marcado; **congelar o Bubble** (ninguém grava). Conferir scheduled workflows na janela (`ResetContagemEmails` se reagenda à meia-noite) | D | — |
| B2 | **Re-extração final** — a carga é idempotente por `bubble_id`: linha existente vira `update` | C | `node tools/carregar-supabase.mjs --relatorio --baixar` e depois sem `--relatorio`; `node tools/carregar-usuarios.mjs`; `node tools/copiar-arquivos-bubble.mjs` |
| B3 | **Conferência**: contagem Bubble × banco por tabela, e soma de dinheiro nas tabelas de venda e financeiro | C | relatório da carga |
| B4 | **Todas as suítes** verdes | C | `npm run verify` e `node scripts/testar-rls*.mjs`, `testar-fila-email.mjs`, `testar-formulario-publico.mjs` |
| B5 | **Contas por convite**: as senhas do Bubble NÃO migram (texto puro, comprometidas). Convite para 100% das contas ativas; desbloquear no Auth só quem estiver ativo | C (script de convite, a escrever) + D (aprovar o envio) | cada ativo recebe o e-mail |
| B6 | **Domínio** apontado para a Vercel | D | app abre no domínio, função em `gru1` |
| B7 | **Desligar Data API e Workflow API do Bubble** e restringir privacy rules. Só depois: **rotacionar a chave da API do Bubble** e apagar `BUBBLE_API_KEY` do `.env` | D | a API responde 401/404 |
| B8 | Varredura final: `get_advisors` só com os avisos aceitos em `specs/05`; nenhum `NEXT_PUBLIC_` com chave de servidor; toda tabela com RLS e policy | C | — |

## C. Depois do corte

- Primeira semana: acompanhar logs da Vercel e do Supabase diariamente; fila de e-mail (`email_outbox`
  com status `falhou`).
- Bubble fica em modo leitura por um prazo combinado (`specs/00` §2.7) e depois é desligado.
- Conciliação de comissão: fórmula nova vale do corte para frente (`specs/03` §9); a diferença com o
  histórico é relatório assinado pela Diretoria, não correção retroativa.

## Rollback

Até o B7 o Bubble continua íntegro: voltar é descongelar o Bubble e avisar a equipe. Depois do B7,
voltar exige religar as APIs do Bubble — por isso o B7 só acontece com o B3 e o B4 limpos.
