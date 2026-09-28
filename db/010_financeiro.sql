-- =====================================================================================
-- 010_financeiro.sql — app-megabox (Supabase `megabox`, Postgres 17)
-- =====================================================================================
-- Fatia 7 de `specs/02-modelo-de-dados-proposto.md` §11 (e `specs/03-plano-de-construcao.md`
-- §6): página `financeiro` e a confirmação de entrega que gera as contas.
--
-- Escopo: §3.4 — `contas_receber`, `contas_pagar`, `baixas`, `estornos`, `cobrancas`,
-- `cobranca_contas`, `recibos`; mais `conta_pagar_entregas` (D1), `email_outbox.cobranca_id` e
-- `email_outbox.recibo_id` (pendência da 008), e as policies ADITIVAS que a 009 deixou para cá
-- ("Leitura/escrita de entregas pela página financeiro").
--
-- Fontes no mapa (via specs/paginas/financeiro.md e financeiro-reusables.md):
--   CriarContasReceber bTfDZ/bTfDb (parcelas), CriarContasPagar bToYh/bToYn (3%, dia 5),
--   confirmação bTcXd/bTcXj (vendas.md §4.8), baixa bTpVQ/bTrPO (financeiro.md §4.4/4.5),
--   estorno bTrtf/bTsBe1 (reusables §4.7), redistribuição sem apagar bTlqO (reusables §5.5),
--   cobrança bTpUa/bTpUb (financeiro.md §4.3), recibo ConfigSistema[17] (financeiro.md §4.5).
--
-- O QUE ESTA MIGRATION FAZ
--   1. 8 tabelas com RLS e policy explícita; 2 sequences (número de cobrança e de recibo).
--   2. Triggers de derivados (FKs de identidade vêm da entrega; status vem das baixas), de
--      trava (valor de parcela com baixa não muda; conta com baixa não cancela; baixa não passa
--      do saldo) e de fechamento (rateio das parcelas = entrega; recibo = soma das baixas).
--   3. Funções de dinheiro, security INVOKER, com teste em scripts/testar-rls-financeiro.mjs:
--      fn_valor_parcela, fn_vencimento_conta_pagar, fn_percentual_comissao_vendedor,
--      fn_gerar_contas_receber, fn_gerar_conta_pagar, fn_confirmar_entrega,
--      fn_reequilibrar_parcelas, fn_baixar_contas_receber, fn_registrar_cobranca.
--   4. Views security_invoker: v_contas_receber, v_contas_pagar, v_conferencia_comissao_entrega.
--   5. Policies ADITIVAS (permissivas, somam por OR às da 007/008/009): a página `financeiro`
--      lê e altera entregas, grava arquivos de entrega (o pop.AnexaNf mora lá) e LÊ a cotação e
--      o pedido das entregas que enxerga.
--   6. Índice em toda FK, os de §6 para o financeiro; fn_set_alterado e fn_auditoria.
--
-- O QUE **NÃO** ENTRA AQUI
--   - FK `contas_pagar.meta_fechada_id` → `metas_fechadas`: a tabela é da 011, que a acrescenta.
--   - `v_lancamentos` (união CR+CP) e `fn_contas_receber(filtros jsonb)`: consultas de tela,
--     entram com a tela.
--   - Histórico da conta (`historicos.conta_receber_id`): `historicos` é da fatia 9.
--   - Bucket de Storage para PDF de cobrança/recibo/NF MegaBox: entra com a tela (as colunas
--     guardam o PATH, §1.8).
--   - Nenhum seed. As sequences começam em 1; NA CARGA: `setval` com count(Cobrancas) e
--     ConfigSistema[17].ValorNumero (financeiro.md §9.4).
--
-- >>> DECISÕES TOMADAS ONDE A SPEC ERA AMBÍGUA, CONFLITAVA COM O MAPA OU ESTÁ SEM RESPOSTA <<<
--   D1. AS DUAS ORIGENS DE CONTA A PAGAR (docs/estado-do-projeto.md §3.4) — O ESQUEMA IMPEDE A
--       DUPLICATA SEM DECIDIR A REGRA. A confirmação da entrega cria CP de 3% (bToYh) e o
--       fechamento da meta cria outra (bTzXn, metas.md §4.11). Aqui: `contas_pagar.origem`
--       ('entrega' | 'meta') e a ligação `conta_pagar_entregas (conta_pagar_id, entrega_id,
--       vendedor_id)` com UNIQUE (entrega_id, vendedor_id): TODA conta a pagar declara as
--       entregas que paga (a de entrega, por trigger, 1 linha; a de meta, pela fn_fechar_meta da
--       011, N linhas), e o banco recusa (23505) a segunda conta que pagaria a MESMA entrega ao
--       MESMO vendedor — venha de onde vier. Quem chega primeiro vale; a outra é recusada.
--       A REGRA de negócio ("o fechamento consolida as da entrega" × "a entrega não gera CP")
--       fica em PARÂMETRO: `fn_confirmar_entrega(..., p_gerar_conta_pagar boolean default true)`
--       aqui e `fn_fechar_meta(..., p_gerar_conta_pagar boolean default true)` na 011. Trocar a
--       regra = mudar um default, sem migration de esquema. `vendedor_id` da ligação é FK
--       composta para `contas_pagar (id, vendedor_id)`: não diverge do da conta.
--   D2. B4 (os 3% são fixos?) — SEM RESPOSTA; RECOMENDAÇÃO PADRÃO (financeiro-reusables
--       [DÚVIDA 23]: "parâmetro com vigência, por nível; manter 3% como valor inicial"). O 0,03
--       estava literal em TRÊS workflows (bToYn, bTpol, bTpor); aqui mora num lugar só,
--       `fn_percentual_comissao_vendedor(vendedor, data)`, que hoje devolve 0.0300 e já recebe
--       vendedor e data — virar lookup por nível/vigência é trocar o corpo DESTA função.
--       `contas_pagar.percentual` fica GRAVADO por conta (o que valia na época).
--   D3. RATEIO EXATO COM A SOBRA NA ÚLTIMA (financeiro-reusables §5.7 e §9.4; [DÚVIDA 5]
--       recomendação "iguais, sobra na última"). `fn_valor_parcela(total, n, i)` =
--       round(total/n, 2) nas i < n e total − soma das anteriores na última. Rateia a COMISSÃO e
--       também o VALOR DA VENDA (`valor_total`): 02 §2.1.2 e [DÚVIDA 3] — hoje bTfDb grava a
--       venda cheia em cada parcela e o recibo soma 4× a venda. Guarda: se round(total/n)×(n−1)
--       passar do total (só com total < 0,005·n·(n−1), ex. R$ 0,07 em 9), usa trunc — a última
--       nunca fica negativa.
--   D4. FECHAMENTO DAS PARCELAS POR CONSTRAINT TRIGGER ADIADA (02 §6, constraint 1): no commit,
--       Σ valor_comissao e Σ valor_total das parcelas NÃO canceladas de uma entrega = comissão e
--       venda bruta da entrega, AO CENTAVO (02 falava em "tolerância de centavos"; com o rateio
--       exato de D3 a tolerância é zero). Dispara quando parcela nasce, muda de valor, é
--       cancelada ou apagada — NÃO quando a entrega muda na página vendas (a divergência aparece
--       em `v_conferencia_comissao_entrega` e se corrige por `fn_reequilibrar_parcelas`).
--       Adiada porque rebalancear toca N parcelas numa transação. NA CARGA: o Bubble tem a venda
--       cheia por parcela e float; carregar com `session_replication_role = replica` e medir a
--       divergência pela view, como a 009 D7.
--   D5. STATUS DERIVADO DAS BAIXAS (02 §3.4: "o status da conta passa a ser derivado"). Fica
--       coluna (índice de §6 filtra por status) mas é ESPELHO por trigger: a conta recalcula o
--       status em todo insert/update a partir das baixas não estornadas e IGNORA o valor enviado
--       pela tela. CR: 1 A receber / 2 Recebido; CP: 3 A pagar / 4 Pago (financeiro [DÚVIDA]
--       "quais status as CPs usam" — status de CP e de CR separados, reusables §8.4.5). Pago
--       quando Σ baixas ≥ valor; BAIXA PARCIAL deixa em aberto com saldo (v_contas_*).
--   D6. NF/RECIBO MEGABOX MORAM NA BAIXA, NÃO NA CONTA. 02 §3.4 deixou `nf_megabox_*` na CR e
--       `dt_credito` na baixa; o que o Bubble carimba na baixa (bTpVQ: NumNfMegabox,
--       DataNfMegabox, AnexoNfMegabox, DataRecebimentoBancocaixa, DataBaixaSistema, QuemBaixou)
--       é UM fato, e o estorno (reusables §4.7) precisa preservá-lo inteiro. Com tudo na baixa,
--       estornar não apaga nada: a baixa fica, com um `estornos` apontando para ela.
--   D7. DENORMALIZADOS: SÓ AS FKs DE IDENTIDADE, DERIVADAS DA ENTREGA. `02` §3.4 copiava na CR 14
--       campos da entrega (datas, NF, qtd, unitário, endereços); financeiro.md §8.2 e reusables
--       §8.4.3 mandam tirá-los ("vêm por join numa view") — são as cópias que hoje divergem,
--       mantidas por 4 workflows. Ficam na tabela só pedido/cotação/proposta/orçamento/cliente/
--       fornecedor/vendedor (filtro e índice), SEMPRE sobrescritas pelo trigger a partir da
--       entrega (como a 009 D6); datas, NF, qtd, unitário e endereços vêm em `v_contas_receber`.
--   D8. SEM EXCLUSÃO FÍSICA DE DINHEIRO (reusables [DÚVIDA 9], §8.4.8): DELETE revogado de
--       authenticated em contas, baixas, estornos, cobranças e recibos. Parcela/conta se
--       CANCELA (`cancelada_em`, motivo obrigatório) e o trigger recusa cancelar o que tem baixa
--       ativa. Por isso `unique (entrega_id, parcela)` de 02 é PARCIAL (`where cancelada_em is
--       null`): entrega cancelada e reconfirmada volta a ter parcela 1.
--   D9. CONTA A PAGAR: `valor_comissao` é COLUNA GERADA = round(valor_base × percentual, 2) —
--       não há como gravar comissão de vendedor à mão (hoje o valor da CP de meta vem do DOM,
--       metas.md §7.5). `pedido_id`/`cliente_id` ficam NULÁVEIS (02 os tinha NOT NULL): a CP de
--       meta paga N entregas e não tem um pedido; o check `origem_coerente` exige entrega na de
--       origem 'entrega' e meta na de origem 'meta'. Para a de entrega, `valor_base` = comissão
--       da entrega (bToYn) quando não informado.
--   D10. VENCIMENTO DA CP: dia 5 do mês seguinte (bToYn `plus_months(1):change_date(5)`), sobre
--       a data REAL de entrega — reusables [DÚVIDA 4], recomendação padrão; o Bubble usa a
--       prevista. Base em PARÂMETRO (`fn_gerar_conta_pagar(..., p_data_base)`). Vencimento da CR:
--       data real + dias do prazo, NÃO cumulativo (bTfDb; os `dtvcto`/`PrazoDias` de bTfIl não
--       existem na assinatura). Data real é OBRIGATÓRIA para gerar parcelas (bTikr, mandatory).
--   D11. RLS DO FINANCEIRO. Página `financeiro` + a regra de 02 §7.3 para Analista/Operador
--       ("entregas e contas: as próprias", relatorios [DÚVIDA 8], recomendação padrão):
--       CR = quem enxerga a ENTREGA (a policy de entregas da página financeiro: hierarquia ≤ 2,
--       vendedor ou substituto). CP (comissão do vendedor, sigilo): lê hierarquia ≤ 2 ou o
--       próprio vendedor; ESCREVE só hierarquia ≤ 2 — ninguém abaixo de Gerente cria ou baixa a
--       própria comissão. Estorno: só perfil 1 (reusables §9.3 `estornarBaixa`: Diretor).
--       ATENÇÃO para quando houver usuário real: um Analista do departamento Financeiro, com a
--       regra padrão, NÃO vê as contas dos outros. Se o Financeiro precisar ver tudo, a mudança
--       é trocar `<= 2` por um critério de departamento nestas policies — registrado aqui.
--   D12. FUNÇÕES SECURITY INVOKER, EXECUTÁVEIS POR authenticated: rodam sob a RLS de quem chama
--       (specs/05, critério para função nova). A confirmação feita na página VENDAS por quem não
--       tem `financeiro` (o vendedor confirma a própria entrega, bTcXd) não passa na RLS das
--       contas — de propósito: a server action confere dono/página e chama A MESMA função com
--       service_role. O cliente nunca grava conta direto sem a página.
--   D13. POLICIES ADITIVAS PARA A PÁGINA FINANCEIRO (pedido da 009): além de entregas e
--       entrega_arquivos, LEITURA de `cotacoes` e `pedidos` das entregas visíveis. Não é luxo:
--       `fn_entrega_derivados` (009, invoker) relê pedido, cotação, proposta e orçamento em todo
--       UPDATE de entrega, e `fn_gerar_contas_receber` lê `pedido_prazos` — sem a leitura, o
--       Financeiro não confirma nem anexa NF. Orçamentos, propostas, itens e prazos herdam da
--       cotação/pedido pelo `exists` das policies da 007/008.
--   D14. COBRANÇA: o fornecedor é DERIVADO da filial escolhida (financeiro [DÚVIDA]: hoje grava o
--       do filtro, que pode estar vazio) e toda CR da cobrança tem de ser desse fornecedor
--       (financeiro.md §9.3). Número por sequence, não `count + 1` (colide). Recibo: número por
--       sequence (não ConfigSistema[17] + 1 gravado 2×), valor = Σ das baixas dele = soma das
--       COMISSÕES (financeiro.md §5, "é a comissão, não a venda"), conferido no commit.
--
-- ORDEM DOS BLOCOS: sequences → tabelas → alter de tabela anterior → índices → funções →
-- views → triggers → RLS e policies → grants.
-- Sem `begin`/`commit`: o script de aplicação e o Supabase envolvem em transação.
-- =====================================================================================


-- =====================================================================================
-- 1. SEQUENCES (D14)
-- =====================================================================================
create sequence public.seq_cobranca_numero as integer start 1;
create sequence public.seq_recibo_numero   as integer start 1;

comment on sequence public.seq_cobranca_numero is
  'Número da cobrança. Substitui Search(Cobrancas):count + 1 calculado no navegador '
  '(financeiro.md §5), que colide com concorrência e exclusão. NA CARGA: setval.';
comment on sequence public.seq_recibo_numero is
  'Número do recibo. Substitui ConfigSistema[CodigoConfig=17].ValorNumero + 1 (bUFHZ1/bTvTT). '
  'NA CARGA: setval com o ValorNumero atual.';


-- =====================================================================================
-- 2. TABELAS (§3.4)
-- =====================================================================================

-- ----------------------------------------------------------------------------- cobrancas
create table public.cobrancas (
  id            uuid primary key default gen_random_uuid(),
  numero        integer not null unique default nextval('public.seq_cobranca_numero'),
  fornecedor_id uuid not null references public.grupos_clifor(id) on delete restrict,
  endereco_fornecedor_id uuid references public.enderecos_clifor(id),
  contato_id    uuid references public.contatos_clifor(id),
  enviada_em    timestamptz,
  arquivo_path  text,
  link          text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id)
);

comment on table public.cobrancas is
  'Era Tbl.Cobrancas (bTpUa). QuaisEntregas está deleted no Bubble; QuaisContasReceber vira '
  'cobranca_contas; CR.CobrancaNum/QualCobranca/QuaisCobrancas (3 representações da mesma '
  'relação) não migram. fornecedor_id = grupo da filial (D14).';
comment on column public.cobrancas.arquivo_path is
  'PDF em bucket PRIVADO (§1.8). Hoje AnexoLink é URL pública do CDN.';

-- --------------------------------------------------------------------------------- recibos
create table public.recibos (
  id            uuid primary key default gen_random_uuid(),
  numero        integer not null unique default nextval('public.seq_recibo_numero'),
  fornecedor_id uuid not null references public.grupos_clifor(id) on delete restrict,
  endereco_fornecedor_id uuid references public.enderecos_clifor(id),
  emitido_em    timestamptz not null default now(),
  emitido_por   uuid not null references public.usuarios(id),
  valor_total   numeric(14,2) not null check (valor_total > 0),
  arquivo_path  text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id)
);

comment on table public.recibos is
  'Declaração de recebimento emitida no lugar da NF MegaBox (financeiro.md §4.5). Não existia '
  'no Bubble: o recibo era só o número carimbado em cada CR. valor_total = Σ das baixas com '
  'este recibo_id, conferido no commit (D14). endereco_fornecedor_id = "CNPJ fornecedor do recibo".';

-- -------------------------------------------------------------------------- contas_receber
create table public.contas_receber (
  id            uuid primary key default gen_random_uuid(),
  entrega_id    uuid not null references public.entregas(id) on delete restrict,
  -- identidade DERIVADA da entrega pelo trigger (D7); sem default, o trigger preenche
  pedido_id     uuid not null references public.pedidos(id) on delete restrict,
  cotacao_id    uuid not null references public.cotacoes(id) on delete restrict,
  proposta_id   uuid references public.propostas(id),
  orcamento_fornecedor_id uuid not null references public.orcamentos_fornecedor(id) on delete restrict,
  cliente_id    uuid not null references public.grupos_clifor(id) on delete restrict,
  fornecedor_id uuid not null references public.grupos_clifor(id) on delete restrict,
  vendedor_id   uuid not null references public.usuarios(id),
  -- a parcela
  parcela        smallint not null check (parcela >= 1),
  parcelas_total smallint not null check (parcelas_total >= 1),
  prazo_id       smallint references public.prazos_recebimento(id),
  valor_total    numeric(14,2) not null check (valor_total >= 0),     -- venda RATEADA (D3)
  valor_comissao numeric(14,2) not null check (valor_comissao >= 0),  -- comissão RATEADA (D3)
  motivo_altera_comissao text,
  dt_vencimento  date not null,
  status_id      smallint not null default 1 references public.status_financeiro(id),
  arquivado      boolean not null default false,
  arquivado_em   timestamptz,
  arquivado_por  uuid references public.usuarios(id),
  cancelada_em   timestamptz,
  cancelada_por  uuid references public.usuarios(id),
  motivo_cancelamento text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint parcela_coerente     check (parcela <= parcelas_total),
  constraint status_de_receber    check (status_id in (1, 2)),
  constraint cancelada_tem_motivo check (cancelada_em is null or nullif(btrim(motivo_cancelamento), '') is not null)
);

comment on table public.contas_receber is
  'Era Tbl.ContasReceber (tbl_contasreceber): comissão que o FORNECEDOR deve à MegaBox, uma linha '
  'por parcela (bTfDZ). Mudanças deliberadas: valor_total e valor_comissao RATEADOS (D3) e '
  'fechando com a entrega no commit (D4); status NOT NULL e derivado das baixas (D5); baixa e '
  'estorno em tabelas próprias (D6); 14 cópias da entrega viram view (D7); sem DELETE (D8). '
  'Auditada por trigger.';
comment on column public.contas_receber.valor_total is
  'VENDA RATEADA pela parcela (fn_valor_parcela). No Bubble bTfDb grava a venda CHEIA em cada '
  'parcela e o recibo soma N× (reusables [DÚVIDA 3]; 02 §8.2 — reversível).';
comment on column public.contas_receber.status_id is
  '1 A receber | 2 Recebido. ESPELHO: o trigger recalcula das baixas não estornadas e ignora o '
  'que a tela mandar (D5). Nasce 1 (no Bubble nascia vazio, reusables [DÚVIDA 7]).';
comment on column public.contas_receber.dt_vencimento is
  'Data REAL da entrega + dias do prazo DA PARCELA, não cumulativo (bTfDb, D10).';

-- ----------------------------------------------------------------------------- contas_pagar
create table public.contas_pagar (
  id            uuid primary key default gen_random_uuid(),
  origem        text not null,
  entrega_id    uuid references public.entregas(id) on delete restrict,
  meta_fechada_id uuid,          -- FK para metas_fechadas(id) entra na 011
  -- identidade derivada da entrega quando origem = 'entrega' (D7, D9)
  pedido_id     uuid references public.pedidos(id) on delete restrict,
  cotacao_id    uuid references public.cotacoes(id) on delete restrict,
  orcamento_fornecedor_id uuid references public.orcamentos_fornecedor(id) on delete restrict,
  cliente_id    uuid references public.grupos_clifor(id) on delete restrict,
  fornecedor_id uuid references public.grupos_clifor(id) on delete restrict,
  vendedor_id   uuid not null references public.usuarios(id),      -- a QUEM se paga
  valor_base    numeric(14,2) not null check (valor_base >= 0),
  percentual    numeric(7,4)  not null check (percentual >= 0 and percentual <= 1),
  valor_comissao numeric(14,2) generated always as (round(valor_base * percentual, 2)) stored,
  motivo_altera_comissao text,
  dt_vencimento date not null,
  status_id     smallint not null default 3 references public.status_financeiro(id),
  arquivado     boolean not null default false,
  arquivado_em  timestamptz,
  arquivado_por uuid references public.usuarios(id),
  cancelada_em  timestamptz,
  cancelada_por uuid references public.usuarios(id),
  motivo_cancelamento text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint origem_valida        check (origem in ('entrega', 'meta')),
  constraint origem_coerente      check (
    (origem = 'entrega' and entrega_id is not null and meta_fechada_id is null)
    or (origem = 'meta' and entrega_id is null and (meta_fechada_id is not null or cancelada_em is not null))
  ),
  constraint status_de_pagar      check (status_id in (3, 4)),
  constraint cancelada_tem_motivo check (cancelada_em is null or nullif(btrim(motivo_cancelamento), '') is not null),
  -- alvo da FK composta de conta_pagar_entregas (D1)
  constraint contas_pagar_id_vendedor_key unique (id, vendedor_id)
);

comment on table public.contas_pagar is
  'Era Tbl.ContasPagar (física tbl_contasreceber1 — o nome engana): comissão a PAGAR ao vendedor. '
  'Duas origens (D1): entrega confirmada (bToYh, 3%) e fechamento de meta (bTzXn, 011). As '
  'entregas pagas por cada conta estão em conta_pagar_entregas, única por (entrega, vendedor). '
  'valor_comissao é GERADO (D9). Tem arquivado, que o Bubble não tinha (reusables §4.11). '
  'Auditada por trigger.';
comment on column public.contas_pagar.percentual is
  'Fração (0.0300 = 3%). Default de fn_percentual_comissao_vendedor (B4, D2); na de meta, o '
  'fator do nível aplicado (B3, 011). Gravado por conta: é o que valia na época.';
comment on column public.contas_pagar.dt_vencimento is
  'Origem entrega: dia 5 do mês seguinte à data REAL de entrega (bToYn; D10). Origem meta: hoje '
  '+ prazo (bTzXn, 10 dias; parâmetro da fn_fechar_meta).';
comment on column public.contas_pagar.meta_fechada_id is
  'Origem meta. FK para metas_fechadas entra na 011 (on delete set null: cancelar o '
  'fechamento cancela a CP antes, e o check aceita meta nula só com a conta cancelada).';

-- --------------------------------------------------------------------- conta_pagar_entregas
create table public.conta_pagar_entregas (
  conta_pagar_id uuid not null,
  vendedor_id    uuid not null,
  entrega_id     uuid not null references public.entregas(id) on delete restrict,
  criado_em      timestamptz not null default now(),
  criado_por     uuid references public.usuarios(id),
  primary key (conta_pagar_id, entrega_id),
  constraint conta_pagar_entregas_conta_fkey foreign key (conta_pagar_id, vendedor_id)
    references public.contas_pagar (id, vendedor_id) on delete cascade on update cascade,
  -- D1: A MESMA ENTREGA NÃO É PAGA DUAS VEZES AO MESMO VENDEDOR, qualquer que seja a origem
  constraint entrega_paga_uma_vez unique (entrega_id, vendedor_id)
);

comment on table public.conta_pagar_entregas is
  'Quais entregas cada conta a pagar paga. Substitui CP.QuaisEntregas (nunca gravado pela CP de '
  'entrega) e MetasFechadas.QuaisContasPagar. É AQUI que o banco recusa a duplicata das duas '
  'origens (docs/estado-do-projeto.md §3.4): unique (entrega_id, vendedor_id). Ligação pura '
  '(sem id nem bubble_id, como as da 006/008); a conta cancelada perde as suas ligações.';

-- ---------------------------------------------------------------------------------- baixas
create table public.baixas (
  id               uuid primary key default gen_random_uuid(),
  conta_receber_id uuid references public.contas_receber(id) on delete restrict,
  conta_pagar_id   uuid references public.contas_pagar(id) on delete restrict,
  valor            numeric(14,2) not null check (valor > 0),
  dt_baixa         date not null default ((now() at time zone 'America/Sao_Paulo')::date),
  dt_credito       date,                -- era DataRecebimentoBancocaixa
  nf_megabox_numero text,               -- ou o número do recibo (D6)
  dt_nf_megabox    date,
  nf_megabox_path  text,
  usuario_id       uuid not null references public.usuarios(id),
  recibo_id        uuid references public.recibos(id) on delete restrict,
  observacao       text,
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint conta_unica check (
    (conta_receber_id is not null)::int + (conta_pagar_id is not null)::int = 1
  )
);

comment on table public.baixas is
  'FATO de recebimento/pagamento (02 §2.1.3, D6). Substitui as colunas DataBaixaSistema, '
  'QuemBaixou, DataRecebimentoBancocaixa, NumNfMegabox, DataNfMegabox e AnexoNfMegabox que o '
  'Bubble carimbava na conta e o estorno/cancelamento apagava. Imutável: sem UPDATE/DELETE para '
  'authenticated. Soma das baixas ativas nunca passa do valor da conta (trigger). Parcial é '
  'permitida. usuario_id = auth.uid() quando há sessão.';
comment on column public.baixas.nf_megabox_path is
  'Anexo da NF MegaBox em bucket PRIVADO (§1.8). Hoje URL pública do CDN (financeiro.md §7.5).';

-- -------------------------------------------------------------------------------- estornos
create table public.estornos (
  id         uuid primary key default gen_random_uuid(),
  baixa_id   uuid not null unique references public.baixas(id) on delete restrict,
  motivo     text not null,
  usuario_id uuid not null references public.usuarios(id),
  em         timestamptz not null default now(),
  -- colunas obrigatórias de §1.2
  bubble_id    text unique,
  criado_em    timestamptz not null default now(),
  criado_por   uuid references public.usuarios(id),
  alterado_em  timestamptz,
  alterado_por uuid references public.usuarios(id),
  constraint motivo_preenchido check (nullif(btrim(motivo), '') is not null)
);

comment on table public.estornos is
  'Estorno é REGISTRO, não UPDATE destrutivo (02 §2.1.3). Uma baixa se estorna uma vez (unique). '
  'Grava quem e quando nas DUAS origens — o estorno de CP do Bubble (bTsBe1) não gravava '
  '(reusables [DÚVIDA 11]). A baixa estornada deixa de contar no status (D5).';

-- ------------------------------------------------------------------------- cobranca_contas
create table public.cobranca_contas (
  cobranca_id      uuid not null references public.cobrancas(id) on delete cascade,
  conta_receber_id uuid not null references public.contas_receber(id) on delete restrict,
  criado_em        timestamptz not null default now(),
  criado_por       uuid references public.usuarios(id),
  primary key (cobranca_id, conta_receber_id)
);

comment on table public.cobranca_contas is
  'Cobrancas.QuaisContasReceber (02 §3.4). Uma CR pode estar em mais de uma cobrança (reenvio). '
  'O trigger exige CR do mesmo fornecedor da cobrança (D14).';


-- =====================================================================================
-- 3. AS COLUNAS QUE A 008 DEIXOU PENDENTES
-- =====================================================================================
alter table public.email_outbox
  add column cobranca_id uuid references public.cobrancas(id) on delete set null,
  add column recibo_id   uuid references public.recibos(id)   on delete set null;

comment on column public.email_outbox.cobranca_id is
  'E-mail de cobrança ao fornecedor (bTpUg). Entrou na 010.';
comment on column public.email_outbox.recibo_id is
  'E-mail do recibo ao fornecedor (bTrNu). Entrou na 010.';


-- =====================================================================================
-- 4. ÍNDICES (§6 — toda FK e toda coluna de filtro/ordenação)
-- =====================================================================================

-- cobrancas (numero é unique)
create index cobrancas_fornecedor_idx   on public.cobrancas (fornecedor_id, criado_em desc);
create index cobrancas_endereco_idx     on public.cobrancas (endereco_fornecedor_id);
create index cobrancas_contato_idx      on public.cobrancas (contato_id);
create index cobrancas_criado_por_idx   on public.cobrancas (criado_por);
create index cobrancas_alterado_por_idx on public.cobrancas (alterado_por);

-- recibos (numero é unique)
create index recibos_fornecedor_idx   on public.recibos (fornecedor_id, emitido_em desc);
create index recibos_endereco_idx     on public.recibos (endereco_fornecedor_id);
create index recibos_emitido_por_idx  on public.recibos (emitido_por);
create index recibos_criado_por_idx   on public.recibos (criado_por);
create index recibos_alterado_por_idx on public.recibos (alterado_por);

-- contas_receber — os dois de §6 pelo nome, a unicidade parcial (D8) e as FKs
create index contas_receber_vencimento_idx on public.contas_receber (dt_vencimento) where not arquivado;
create index contas_receber_fornecedor_status_idx
  on public.contas_receber (fornecedor_id, status_id, dt_vencimento);
create unique index contas_receber_parcela_uidx on public.contas_receber (entrega_id, parcela)
  where cancelada_em is null;
create index contas_receber_entrega_idx    on public.contas_receber (entrega_id);
create index contas_receber_pedido_idx     on public.contas_receber (pedido_id);
create index contas_receber_cotacao_idx    on public.contas_receber (cotacao_id);
create index contas_receber_proposta_idx   on public.contas_receber (proposta_id);
create index contas_receber_orcamento_idx  on public.contas_receber (orcamento_fornecedor_id);
create index contas_receber_cliente_idx    on public.contas_receber (cliente_id);
create index contas_receber_vendedor_idx   on public.contas_receber (vendedor_id, dt_vencimento);
create index contas_receber_prazo_idx      on public.contas_receber (prazo_id);
create index contas_receber_status_idx     on public.contas_receber (status_id, dt_vencimento);
create index contas_receber_arquivado_por_idx on public.contas_receber (arquivado_por);
create index contas_receber_cancelada_por_idx on public.contas_receber (cancelada_por);
create index contas_receber_criado_por_idx    on public.contas_receber (criado_por);
create index contas_receber_alterado_por_idx  on public.contas_receber (alterado_por);

-- contas_pagar — o de §6 pelo nome, as unicidades de D1 e as FKs
create index contas_pagar_vendedor_venc_idx on public.contas_pagar (vendedor_id, dt_vencimento);
create unique index contas_pagar_entrega_uidx on public.contas_pagar (entrega_id, vendedor_id)
  where cancelada_em is null and entrega_id is not null;
create unique index contas_pagar_meta_uidx on public.contas_pagar (meta_fechada_id)
  where cancelada_em is null and meta_fechada_id is not null;
create index contas_pagar_entrega_idx    on public.contas_pagar (entrega_id);
create index contas_pagar_meta_idx       on public.contas_pagar (meta_fechada_id);
create index contas_pagar_pedido_idx     on public.contas_pagar (pedido_id);
create index contas_pagar_cotacao_idx    on public.contas_pagar (cotacao_id);
create index contas_pagar_orcamento_idx  on public.contas_pagar (orcamento_fornecedor_id);
create index contas_pagar_cliente_idx    on public.contas_pagar (cliente_id);
create index contas_pagar_fornecedor_idx on public.contas_pagar (fornecedor_id);
create index contas_pagar_status_idx     on public.contas_pagar (status_id, dt_vencimento);
create index contas_pagar_arquivado_por_idx on public.contas_pagar (arquivado_por);
create index contas_pagar_cancelada_por_idx on public.contas_pagar (cancelada_por);
create index contas_pagar_criado_por_idx    on public.contas_pagar (criado_por);
create index contas_pagar_alterado_por_idx  on public.contas_pagar (alterado_por);

-- conta_pagar_entregas (pk cobre conta_pagar_id; o unique cobre entrega_id)
create index conta_pagar_entregas_fk_idx        on public.conta_pagar_entregas (conta_pagar_id, vendedor_id);
create index conta_pagar_entregas_criado_por_idx on public.conta_pagar_entregas (criado_por);

-- baixas
create index baixas_conta_receber_idx on public.baixas (conta_receber_id) where conta_receber_id is not null;
create index baixas_conta_pagar_idx   on public.baixas (conta_pagar_id)   where conta_pagar_id is not null;
create index baixas_recibo_idx        on public.baixas (recibo_id)        where recibo_id is not null;
create index baixas_usuario_idx       on public.baixas (usuario_id);
create index baixas_dt_baixa_idx      on public.baixas (dt_baixa);
create index baixas_dt_credito_idx    on public.baixas (dt_credito) where dt_credito is not null;
create index baixas_dt_nf_idx         on public.baixas (dt_nf_megabox) where dt_nf_megabox is not null;
create index baixas_nf_idx            on public.baixas (nf_megabox_numero) where nf_megabox_numero is not null;
create index baixas_criado_por_idx    on public.baixas (criado_por);
create index baixas_alterado_por_idx  on public.baixas (alterado_por);

-- estornos (baixa_id é unique)
create index estornos_usuario_idx      on public.estornos (usuario_id);
create index estornos_criado_por_idx   on public.estornos (criado_por);
create index estornos_alterado_por_idx on public.estornos (alterado_por);

-- cobranca_contas (pk cobre cobranca_id)
create index cobranca_contas_conta_idx      on public.cobranca_contas (conta_receber_id);
create index cobranca_contas_criado_por_idx on public.cobranca_contas (criado_por);

-- email_outbox
create index email_outbox_cobranca_idx on public.email_outbox (cobranca_id);
create index email_outbox_recibo_idx   on public.email_outbox (recibo_id);


-- =====================================================================================
-- 5. FUNÇÕES DE CÁLCULO (puras; com teste — CLAUDE.md regra 10)
-- =====================================================================================

-- ------------------------------------------------------------------------ fn_valor_parcela
create function public.fn_valor_parcela(p_total numeric, p_n integer, p_i integer)
  returns numeric
  language plpgsql
  immutable
  strict
  set search_path = ''
as $$
declare
  v_base numeric;
begin
  if p_n < 1 or p_i < 1 or p_i > p_n then
    raise exception 'Parcela % de % não existe', p_i, p_n using errcode = '22023';
  end if;
  if p_total < 0 then
    raise exception 'Total negativo não se rateia (%)', p_total using errcode = '22023';
  end if;

  v_base := round(p_total / p_n, 2);
  -- guarda de D3: a última nunca fica negativa
  if v_base * (p_n - 1) > p_total then
    v_base := trunc(p_total / p_n, 2);
  end if;

  if p_i < p_n then
    return v_base;
  end if;
  return p_total - v_base * (p_n - 1);   -- a sobra de centavos vai na última
end $$;

comment on function public.fn_valor_parcela(numeric, integer, integer) is
  'Rateio exato (D3; financeiro-reusables §9.4): round(total/n, 2) nas i < n; a última leva '
  'total − soma das anteriores. Σ das n parcelas = total, sempre. Ex.: 1000,00 em 3 = '
  '333,33 + 333,33 + 333,34.';

-- --------------------------------------------------------------- fn_vencimento_conta_pagar
create function public.fn_vencimento_conta_pagar(p_data date)
  returns date
  language sql
  immutable
  strict
  set search_path = ''
as $$
  -- primeiro dia do mês de p_data, + 1 mês, + 4 dias = dia 5 do mês seguinte
  select ((p_data - (extract(day from p_data)::integer - 1)) + interval '1 month')::date + 4
$$;

comment on function public.fn_vencimento_conta_pagar(date) is
  'bToYn: DtEntrega:plus_months(1):change_date(5) — dia 5 do mês seguinte. Independe do tamanho '
  'do mês (31/01 → 05/02; 15/12 → 05/01 do ano seguinte). Base = data REAL (D10).';

-- ------------------------------------------------------- fn_percentual_comissao_vendedor (B4)
create function public.fn_percentual_comissao_vendedor(p_vendedor uuid, p_data date)
  returns numeric
  language sql
  stable
  set search_path = ''
as $$
  -- B4 SEM RESPOSTA (specs/04-duvidas.md §1): recomendação padrão = 3% para todos, hoje.
  -- ESTE é o único lugar do número. Por nível/vigência = trocar este corpo por um lookup
  -- (ex.: em vendedor_nivel_historico da 011); a assinatura já recebe vendedor e data.
  select 0.0300::numeric
$$;

comment on function public.fn_percentual_comissao_vendedor(uuid, date) is
  'B4 isolada (D2): percentual da comissão do vendedor sobre a comissão da entrega. Hoje 0.0300 '
  'para todos (o 0,03 literal de bToYn, bTpol e bTpor). Mudar a regra = mudar só esta função.';


-- =====================================================================================
-- 6. FUNÇÕES DE TRIGGER (security invoker; ninguém as chama por RPC)
-- =====================================================================================

-- ---------------------------------------------------------------- fn_conta_receber_derivados
create function public.fn_conta_receber_derivados()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_e       record;
  v_baixado numeric;
  v_ativas  integer;
begin
  if tg_op = 'UPDATE' and new.entrega_id is distinct from old.entrega_id then
    raise exception 'A parcela não muda de entrega' using errcode = '55000';
  end if;

  select e.pedido_id, e.cotacao_id, e.proposta_id, e.orcamento_fornecedor_id, e.cliente_id,
         e.fornecedor_id, e.vendedor_id, e.status_id
    into v_e
  from public.entregas e where e.id = new.entrega_id;
  if not found then
    raise exception 'Entrega % não encontrada (ou sem acesso)', new.entrega_id using errcode = '42501';
  end if;
  if tg_op = 'INSERT' and v_e.status_id = 7 then
    raise exception 'Entrega cancelada não gera conta a receber' using errcode = '55000';
  end if;

  -- D7: identidade sempre derivada da entrega
  new.pedido_id               := v_e.pedido_id;
  new.cotacao_id              := v_e.cotacao_id;
  new.proposta_id             := v_e.proposta_id;
  new.orcamento_fornecedor_id := v_e.orcamento_fornecedor_id;
  new.cliente_id              := v_e.cliente_id;
  new.fornecedor_id           := v_e.fornecedor_id;
  new.vendedor_id             := v_e.vendedor_id;

  select coalesce(sum(b.valor), 0), count(*) into v_baixado, v_ativas
  from public.baixas b
  where b.conta_receber_id = new.id
    and not exists (select 1 from public.estornos s where s.baixa_id = b.id);

  if tg_op = 'UPDATE' then
    if v_ativas > 0 and (new.valor_comissao <> old.valor_comissao or new.valor_total <> old.valor_total) then
      raise exception 'Parcela com baixa não muda de valor: estorne a baixa antes' using errcode = '55000';
    end if;
    if v_ativas > 0 and new.cancelada_em is not null and old.cancelada_em is null then
      raise exception 'Parcela com baixa não se cancela: estorne a baixa antes' using errcode = '55000';
    end if;
    if new.valor_comissao is distinct from old.valor_comissao
       and nullif(btrim(new.motivo_altera_comissao), '') is null then
      raise exception 'Alterar a comissão exige motivo' using errcode = '23514';
    end if;
    if new.cancelada_em is not null and old.cancelada_em is null then
      new.cancelada_por := coalesce(auth.uid(), new.cancelada_por);
    end if;
    if new.arquivado is distinct from old.arquivado then
      new.arquivado_em  := case when new.arquivado then now() end;
      new.arquivado_por := case when new.arquivado then auth.uid() end;
    end if;
  end if;

  -- D5: status é espelho das baixas não estornadas
  new.status_id := case when v_ativas > 0 and v_baixado >= new.valor_comissao then 2 else 1 end;
  return new;
end $$;

comment on function public.fn_conta_receber_derivados() is
  'BEFORE INSERT OR UPDATE de contas_receber: identidade da entrega (D7), status das baixas (D5), '
  'travas de parcela com baixa, motivo obrigatório ao mudar a comissão (reusables [DÚVIDA 8]).';

-- ------------------------------------------------------------------ fn_conta_pagar_derivados
create function public.fn_conta_pagar_derivados()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_e       record;
  v_pago    numeric;
  v_ativas  integer;
begin
  if tg_op = 'UPDATE' and (new.origem is distinct from old.origem
                           or new.entrega_id is distinct from old.entrega_id) then
    raise exception 'A conta a pagar não muda de origem nem de entrega' using errcode = '55000';
  end if;

  if new.origem = 'entrega' then
    select e.pedido_id, e.cotacao_id, e.orcamento_fornecedor_id, e.cliente_id, e.fornecedor_id,
           e.vendedor_id, e.valor_comissao, e.dt_entrega, e.status_id
      into v_e
    from public.entregas e where e.id = new.entrega_id;
    if not found then
      raise exception 'Entrega % não encontrada (ou sem acesso)', new.entrega_id using errcode = '42501';
    end if;
    if tg_op = 'INSERT' and v_e.status_id = 7 then
      raise exception 'Entrega cancelada não gera conta a pagar' using errcode = '55000';
    end if;
    new.pedido_id               := v_e.pedido_id;
    new.cotacao_id              := v_e.cotacao_id;
    new.orcamento_fornecedor_id := v_e.orcamento_fornecedor_id;
    new.cliente_id              := v_e.cliente_id;
    new.fornecedor_id           := v_e.fornecedor_id;
    if tg_op = 'INSERT' then
      new.vendedor_id   := coalesce(new.vendedor_id, v_e.vendedor_id);
      new.valor_base    := coalesce(new.valor_base, v_e.valor_comissao);          -- bToYn (D9)
      new.percentual    := coalesce(new.percentual,
                             public.fn_percentual_comissao_vendedor(new.vendedor_id, v_e.dt_entrega));
      new.dt_vencimento := coalesce(new.dt_vencimento, public.fn_vencimento_conta_pagar(v_e.dt_entrega));
    end if;
  end if;

  select coalesce(sum(b.valor), 0), count(*) into v_pago, v_ativas
  from public.baixas b
  where b.conta_pagar_id = new.id
    and not exists (select 1 from public.estornos s where s.baixa_id = b.id);

  if tg_op = 'UPDATE' then
    if (new.valor_base <> old.valor_base or new.percentual <> old.percentual) then
      if v_ativas > 0 then
        raise exception 'Conta a pagar com baixa não muda de valor: estorne antes' using errcode = '55000';
      end if;
      if nullif(btrim(new.motivo_altera_comissao), '') is null then
        raise exception 'Alterar a comissão exige motivo' using errcode = '23514';
      end if;
    end if;
    if new.cancelada_em is not null and old.cancelada_em is null then
      if v_ativas > 0 then
        raise exception 'Conta a pagar com baixa não se cancela: estorne antes' using errcode = '55000';
      end if;
      new.cancelada_por := coalesce(auth.uid(), new.cancelada_por);
    end if;
    if new.arquivado is distinct from old.arquivado then
      new.arquivado_em  := case when new.arquivado then now() end;
      new.arquivado_por := case when new.arquivado then auth.uid() end;
    end if;
  end if;

  -- D5: status espelho das baixas; valor_comissao é gerado, então recalcula aqui mesmo
  new.status_id := case
    when v_ativas > 0 and v_pago >= round(new.valor_base * new.percentual, 2) then 4 else 3 end;
  return new;
end $$;

comment on function public.fn_conta_pagar_derivados() is
  'BEFORE INSERT OR UPDATE de contas_pagar: identidade e valor-base da entrega na origem '
  '''entrega'' (D9), percentual de B4 (D2), vencimento do dia 5 (D10), status das baixas (D5).';

-- ------------------------------------------------------------------ fn_conta_pagar_vinculos
create function public.fn_conta_pagar_vinculos()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  if tg_op = 'INSERT' and new.origem = 'entrega' then
    -- D1: a CP de entrega declara a entrega que paga. Se ela já é paga a este vendedor (por
    -- outra CP de entrega OU por uma meta fechada), o unique entrega_paga_uma_vez recusa.
    insert into public.conta_pagar_entregas (conta_pagar_id, vendedor_id, entrega_id, criado_por)
    values (new.id, new.vendedor_id, new.entrega_id, auth.uid());
  elsif tg_op = 'UPDATE' and new.cancelada_em is not null and old.cancelada_em is null then
    -- conta cancelada deixa de pagar: as entregas voltam a poder ser pagas
    delete from public.conta_pagar_entregas where conta_pagar_id = new.id;
  end if;
  return null;
end $$;

comment on function public.fn_conta_pagar_vinculos() is
  'AFTER INSERT OR UPDATE de contas_pagar: cria a ligação da CP de entrega (D1) e solta as '
  'ligações da conta cancelada.';

-- ---------------------------------------------------------------------- fn_baixa_antes
create function public.fn_baixa_antes()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_valor     numeric;
  v_cancelada timestamptz;
  v_baixado   numeric;
begin
  new.usuario_id := coalesce(auth.uid(), new.usuario_id);

  -- trava a conta: duas baixas simultâneas não passam juntas do saldo
  if new.conta_receber_id is not null then
    select c.valor_comissao, c.cancelada_em into v_valor, v_cancelada
    from public.contas_receber c where c.id = new.conta_receber_id for update;
  else
    select c.valor_comissao, c.cancelada_em into v_valor, v_cancelada
    from public.contas_pagar c where c.id = new.conta_pagar_id for update;
  end if;
  if not found then
    raise exception 'Conta não encontrada (ou sem acesso)' using errcode = '42501';
  end if;
  if v_cancelada is not null then
    raise exception 'Conta cancelada não recebe baixa' using errcode = '55000';
  end if;

  select coalesce(sum(b.valor), 0) into v_baixado
  from public.baixas b
  where (b.conta_receber_id = new.conta_receber_id or b.conta_pagar_id = new.conta_pagar_id)
    and not exists (select 1 from public.estornos s where s.baixa_id = b.id);

  if v_baixado + new.valor > v_valor then
    raise exception 'Baixa de % passa do saldo % da conta', new.valor, v_valor - v_baixado
      using errcode = '23514';
  end if;
  return new;
end $$;

comment on function public.fn_baixa_antes() is
  'BEFORE INSERT de baixas: autor = auth.uid(); trava a conta (for update); recusa conta '
  'cancelada e baixa acima do saldo. Baixa parcial é permitida.';

-- ------------------------------------------------------------- fn_baixa_atualiza_conta
-- Toca a conta para o trigger dela recalcular o status (D5). Serve à baixa e ao estorno.
create function public.fn_baixa_atualiza_conta()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_cr uuid;
  v_cp uuid;
begin
  if tg_table_name = 'estornos' then
    select b.conta_receber_id, b.conta_pagar_id into v_cr, v_cp
    from public.baixas b where b.id = new.baixa_id;
  else
    v_cr := new.conta_receber_id;
    v_cp := new.conta_pagar_id;
  end if;

  if v_cr is not null then
    update public.contas_receber set status_id = status_id where id = v_cr;
  end if;
  if v_cp is not null then
    update public.contas_pagar set status_id = status_id where id = v_cp;
  end if;
  return null;
end $$;

comment on function public.fn_baixa_atualiza_conta() is
  'AFTER INSERT de baixas e de estornos: força o recálculo do status da conta (D5).';

-- ---------------------------------------------------------------------- fn_estorno_antes
create function public.fn_estorno_antes()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  new.usuario_id := coalesce(auth.uid(), new.usuario_id);
  new.em         := now();
  return new;
end $$;

comment on function public.fn_estorno_antes() is
  'BEFORE INSERT de estornos: autor = auth.uid() e hora do servidor (reusables [DÚVIDA 11]).';

-- ------------------------------------------------------------------ fn_recibo_antes
create function public.fn_recibo_antes()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    new.emitido_por := coalesce(auth.uid(), new.emitido_por);
  end if;
  return new;
end $$;

comment on function public.fn_recibo_antes() is
  'BEFORE INSERT de recibos: emitido_por = auth.uid() quando há sessão.';

-- --------------------------------------------------------------- fn_valida_rateio_cr (D4)
create function public.fn_valida_rateio_cr()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_entrega  uuid;
  v_qtd      integer;
  v_comissao numeric;
  v_venda    numeric;
  v_e        record;
begin
  v_entrega := case when tg_op = 'DELETE' then old.entrega_id else new.entrega_id end;

  select count(*), coalesce(sum(c.valor_comissao), 0), coalesce(sum(c.valor_total), 0)
    into v_qtd, v_comissao, v_venda
  from public.contas_receber c
  where c.entrega_id = v_entrega and c.cancelada_em is null;

  if v_qtd = 0 then
    return null;          -- entrega sem parcelas ativas (nenhuma, ou todas canceladas)
  end if;

  select e.valor_comissao, e.valor_venda_bruto into v_e
  from public.entregas e where e.id = v_entrega;

  if v_comissao <> v_e.valor_comissao or v_venda <> v_e.valor_venda_bruto then
    raise exception 'As parcelas da entrega % somam comissão % e venda %; a entrega tem % e %',
      v_entrega, v_comissao, v_venda, v_e.valor_comissao, v_e.valor_venda_bruto
      using errcode = '23514';
  end if;
  return null;
end $$;

comment on function public.fn_valida_rateio_cr() is
  'CONSTRAINT TRIGGER adiada (D4; 02 §6 constraint 1): no commit, Σ das parcelas não canceladas '
  '= comissão e venda da entrega, ao centavo.';

-- --------------------------------------------------------------------- fn_valida_recibo
create function public.fn_valida_recibo()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_recibo  uuid;
  v_r       record;
  v_soma    numeric;
  v_errados integer;
begin
  -- if/else, não CASE: o plpgsql prepara a expressão inteira, e `recibo_id` não existe em recibos
  if tg_table_name = 'recibos' then
    v_recibo := new.id;
  else
    v_recibo := new.recibo_id;
  end if;
  if v_recibo is null then
    return null;
  end if;

  select r.valor_total, r.fornecedor_id into v_r from public.recibos r where r.id = v_recibo;

  select coalesce(sum(b.valor), 0),
         count(*) filter (where b.conta_receber_id is null or c.fornecedor_id <> v_r.fornecedor_id)
    into v_soma, v_errados
  from public.baixas b
  left join public.contas_receber c on c.id = b.conta_receber_id
  where b.recibo_id = v_recibo;

  if v_errados > 0 then
    raise exception 'O recibo % só declara contas a receber do fornecedor dele', v_recibo
      using errcode = '23514';
  end if;
  if v_soma <> v_r.valor_total then
    raise exception 'O recibo % declara % mas as baixas dele somam %', v_recibo, v_r.valor_total, v_soma
      using errcode = '23514';
  end if;
  return null;
end $$;

comment on function public.fn_valida_recibo() is
  'CONSTRAINT TRIGGER adiada (D14): valor do recibo = Σ das baixas com ele, e todas são CR do '
  'fornecedor do recibo.';

-- ------------------------------------------------------------ fn_cobranca_conta_fornecedor
create function public.fn_cobranca_conta_fornecedor()
  returns trigger
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  new.criado_por := coalesce(auth.uid(), new.criado_por);
  if not exists (
    select 1
    from public.cobrancas cb
    join public.contas_receber c on c.id = new.conta_receber_id
    where cb.id = new.cobranca_id and c.fornecedor_id = cb.fornecedor_id
  ) then
    raise exception 'A conta % não é do fornecedor da cobrança', new.conta_receber_id
      using errcode = '23514';
  end if;
  return new;
end $$;

comment on function public.fn_cobranca_conta_fornecedor() is
  'BEFORE INSERT OR UPDATE de cobranca_contas: a CR tem de ser do fornecedor da cobrança '
  '(financeiro.md §9.3 e §4.3: hoje não há essa validação).';

revoke execute on function public.fn_conta_receber_derivados()   from anon, authenticated, public;
revoke execute on function public.fn_conta_pagar_derivados()     from anon, authenticated, public;
revoke execute on function public.fn_conta_pagar_vinculos()      from anon, authenticated, public;
revoke execute on function public.fn_baixa_antes()               from anon, authenticated, public;
revoke execute on function public.fn_baixa_atualiza_conta()      from anon, authenticated, public;
revoke execute on function public.fn_estorno_antes()             from anon, authenticated, public;
revoke execute on function public.fn_recibo_antes()              from anon, authenticated, public;
revoke execute on function public.fn_valida_rateio_cr()          from anon, authenticated, public;
revoke execute on function public.fn_valida_recibo()             from anon, authenticated, public;
revoke execute on function public.fn_cobranca_conta_fornecedor() from anon, authenticated, public;


-- =====================================================================================
-- 7. FUNÇÕES DE NEGÓCIO (security invoker — D12; chamadas por RPC ou server action)
-- =====================================================================================

-- ------------------------------------------------------------------ fn_gerar_contas_receber
create function public.fn_gerar_contas_receber(p_entrega uuid, p_prazos smallint[] default null)
  returns setof public.contas_receber
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_e      record;
  v_prazos smallint[];
  v_n      integer;
begin
  select e.id, e.pedido_id, e.status_id, e.dt_entrega, e.valor_comissao, e.valor_venda_bruto,
         e.motivo_alteracao_valores
    into v_e
  from public.entregas e where e.id = p_entrega
  for update;                               -- serializa o clique duplo (reusables §4.5)
  if not found then
    raise exception 'Entrega % não encontrada (ou sem acesso)', p_entrega using errcode = 'P0002';
  end if;
  if v_e.status_id = 7 then
    raise exception 'Entrega cancelada não gera conta a receber' using errcode = '55000';
  end if;
  if v_e.dt_entrega is null then
    raise exception 'A data REAL de entrega é obrigatória para gerar as parcelas (bTikr)'
      using errcode = '23502';
  end if;
  if exists (select 1 from public.contas_receber c
             where c.entrega_id = p_entrega and c.cancelada_em is null) then
    -- idempotente por recusa: hoje o segundo clique duplica (reusables §4.5, vendas [DÚVIDA 9])
    raise exception 'A entrega % já tem parcelas; use fn_reequilibrar_parcelas', p_entrega
      using errcode = '23505';
  end if;

  -- sem prazos informados, vale a condição negociada do pedido (bTryZ1: Pedido.PrazoRecebComissoes)
  v_prazos := coalesce(
    p_prazos,
    (select array_agg(pp.prazo_id order by pr.dias_prazo, pr.id)
     from public.pedido_prazos pp
     join public.prazos_recebimento pr on pr.id = pp.prazo_id
     where pp.pedido_id = v_e.pedido_id)
  );
  v_n := coalesce(array_length(v_prazos, 1), 0);
  if v_n = 0 then
    raise exception 'Sem prazos: informe os prazos ou grave a condição negociada do pedido'
      using errcode = '23502';
  end if;

  return query
  with novas as (
    insert into public.contas_receber
      (entrega_id, parcela, parcelas_total, prazo_id, valor_total, valor_comissao,
       dt_vencimento, motivo_altera_comissao, criado_por)
    select p_entrega, t.i::smallint, v_n::smallint, t.prazo,
           public.fn_valor_parcela(v_e.valor_venda_bruto, v_n, t.i::integer),
           public.fn_valor_parcela(v_e.valor_comissao,    v_n, t.i::integer),
           v_e.dt_entrega + pr.dias_prazo,                 -- bTfDb: data real + dias do prazo
           v_e.motivo_alteracao_valores,
           auth.uid()
    from unnest(v_prazos) with ordinality as t(prazo, i)
    join public.prazos_recebimento pr on pr.id = t.prazo
    returning *
  )
  select * from novas order by parcela;
end $$;

comment on function public.fn_gerar_contas_receber(uuid, smallint[]) is
  'CriarContasReceber (bTfDZ/bTfDb) numa transação, sem recursão: uma parcela por prazo, na ordem '
  'do array (Prazos[Fila]); valores RATEADOS por fn_valor_parcela (D3); vencimento = data real + '
  'dias do prazo (D10). Recusa entrega cancelada, sem data real ou que já tem parcelas.';

-- --------------------------------------------------------------------- fn_gerar_conta_pagar
create function public.fn_gerar_conta_pagar(
  p_entrega    uuid,
  p_percentual numeric default null,
  p_data_base  date default null
)
  returns public.contas_pagar
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_e    record;
  v_base date;
  v_cp   public.contas_pagar;
begin
  select e.id, e.status_id, e.dt_entrega, e.vendedor_id, e.valor_comissao into v_e
  from public.entregas e where e.id = p_entrega
  for update;
  if not found then
    raise exception 'Entrega % não encontrada (ou sem acesso)', p_entrega using errcode = 'P0002';
  end if;
  if v_e.status_id = 7 then
    raise exception 'Entrega cancelada não gera conta a pagar' using errcode = '55000';
  end if;

  v_base := coalesce(p_data_base, v_e.dt_entrega);         -- D10: real por padrão
  if v_base is null then
    raise exception 'Sem data base para o vencimento da conta a pagar' using errcode = '23502';
  end if;

  insert into public.contas_pagar
    (origem, entrega_id, vendedor_id, valor_base, percentual, dt_vencimento, criado_por)
  values
    ('entrega', p_entrega, v_e.vendedor_id, v_e.valor_comissao,
     coalesce(p_percentual, public.fn_percentual_comissao_vendedor(v_e.vendedor_id, v_base)),
     public.fn_vencimento_conta_pagar(v_base),
     auth.uid())
  returning * into v_cp;

  return v_cp;
end $$;

comment on function public.fn_gerar_conta_pagar(uuid, numeric, date) is
  'CriarContasPagar (bToYh/bToYn): comissão do vendedor = round(comissão da entrega × percentual, '
  '2), percentual de B4 (D2), vencimento dia 5 do mês seguinte à data base (D10). Duplicata — '
  'mesma entrega e vendedor, de qualquer origem — é recusada pelo banco (D1, 23505).';

-- ---------------------------------------------------------------------- fn_confirmar_entrega
create function public.fn_confirmar_entrega(
  p_entrega    uuid,
  p_dt_entrega date,
  p_prazos     smallint[] default null,
  p_gerar_conta_pagar boolean default true
)
  returns void
  language plpgsql
  security invoker
  set search_path = ''
as $$
begin
  if p_dt_entrega is null then
    raise exception 'A data real de entrega é obrigatória' using errcode = '23502';
  end if;

  -- bTcXj: data real + status Financeiro (não rebaixa quem já está Concluído)
  update public.entregas
     set dt_entrega = p_dt_entrega,
         status_id  = case when status_id < 5 then 5 else status_id end
   where id = p_entrega and status_id <> 7;
  if not found then
    raise exception 'Entrega % não encontrada, cancelada ou sem acesso', p_entrega using errcode = 'P0002';
  end if;

  -- idempotente: regravar a confirmação NÃO duplica (vendas [DÚVIDA 9])
  if not exists (select 1 from public.contas_receber c
                 where c.entrega_id = p_entrega and c.cancelada_em is null) then
    perform public.fn_gerar_contas_receber(p_entrega, p_prazos);
  end if;

  -- D1: a regra das duas origens fica AQUI, no parâmetro. A duplicata é o banco que recusa.
  if p_gerar_conta_pagar and not exists (
       select 1 from public.contas_pagar cp
       where cp.origem = 'entrega' and cp.entrega_id = p_entrega and cp.cancelada_em is null) then
    perform public.fn_gerar_conta_pagar(p_entrega);
  end if;
end $$;

comment on function public.fn_confirmar_entrega(uuid, date, smallint[], boolean) is
  'Confirmação de entrega (bTcXd) numa transação: data real, status Financeiro, parcelas a '
  'receber (bTfDZ) e — se p_gerar_conta_pagar — a comissão do vendedor (bToYx). Idempotente. '
  'p_gerar_conta_pagar isola a pergunta das duas origens (D1; estado-do-projeto §3.4).';

-- ------------------------------------------------------------------ fn_reequilibrar_parcelas
create function public.fn_reequilibrar_parcelas(p_entrega uuid, p_motivo text)
  returns setof public.contas_receber
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_e record;
  v_n integer;
begin
  if nullif(btrim(p_motivo), '') is null then
    raise exception 'Reequilibrar a comissão exige motivo' using errcode = '23514';
  end if;

  select e.id, e.valor_comissao, e.valor_venda_bruto into v_e
  from public.entregas e where e.id = p_entrega for update;
  if not found then
    raise exception 'Entrega % não encontrada (ou sem acesso)', p_entrega using errcode = 'P0002';
  end if;

  select count(*) into v_n
  from public.contas_receber c where c.entrega_id = p_entrega and c.cancelada_em is null;
  if v_n = 0 then
    raise exception 'A entrega % não tem parcelas a reequilibrar', p_entrega using errcode = 'P0002';
  end if;
  -- reusables §9.3: recusa se QUALQUER parcela tiver baixa ativa — mesmo que o valor dela não
  -- fosse mudar (o trigger só pega a que muda). Estornar antes.
  if exists (select 1
             from public.contas_receber c
             join public.baixas b on b.conta_receber_id = c.id
             where c.entrega_id = p_entrega and c.cancelada_em is null
               and not exists (select 1 from public.estornos s where s.baixa_id = b.id)) then
    raise exception 'A entrega % tem parcela com baixa: estorne antes de reequilibrar', p_entrega
      using errcode = '55000';
  end if;

  -- bTlqO/bTlqU: redistribui SEM apagar — preserva id, prazo, vencimento, cobrança e histórico.
  update public.contas_receber c
     set valor_comissao = public.fn_valor_parcela(v_e.valor_comissao,    v_n, x.i),
         valor_total    = public.fn_valor_parcela(v_e.valor_venda_bruto, v_n, x.i),
         motivo_altera_comissao = p_motivo
    from (select c2.id, row_number() over (order by c2.parcela)::integer as i
          from public.contas_receber c2
          where c2.entrega_id = p_entrega and c2.cancelada_em is null) x
   where c.id = x.id;

  -- a comissão do vendedor acompanha, se for da entrega e ainda não paga (bTlqZ → bToYn)
  update public.contas_pagar cp
     set valor_base = v_e.valor_comissao,
         motivo_altera_comissao = p_motivo
   where cp.origem = 'entrega' and cp.entrega_id = p_entrega and cp.cancelada_em is null
     and cp.valor_base <> v_e.valor_comissao;

  return query
  select * from public.contas_receber c
  where c.entrega_id = p_entrega and c.cancelada_em is null
  order by c.parcela;
end $$;

comment on function public.fn_reequilibrar_parcelas(uuid, text) is
  'A regra da versão ANTIGA (bTlqO, reusables §5.5 — "esta é a regra a reproduzir"): redistribui '
  'comissão e venda atuais da entrega pelas parcelas abertas, sem apagá-las; ajusta a CP de '
  'entrega. Motivo obrigatório; recusa se houver baixa.';

-- ------------------------------------------------------------------ fn_baixar_contas_receber
create function public.fn_baixar_contas_receber(
  p_contas          uuid[],
  p_dt_credito      date,
  p_dt_nf           date,
  p_nf_numero       text default null,
  p_nf_path         text default null,
  p_gerar_recibo    boolean default false,
  p_recibo_endereco uuid default null
)
  returns uuid
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_qtd        integer;
  v_achadas    integer;
  v_abertas    integer;
  v_fornec     integer;
  v_forn_id    uuid;
  v_total      numeric;
  v_recibo     uuid;
  v_recibo_num integer;
begin
  v_qtd := coalesce(array_length(p_contas, 1), 0);
  if v_qtd = 0 then
    raise exception 'Nenhuma conta selecionada' using errcode = '22023';
  end if;
  if p_dt_credito is null or p_dt_nf is null then
    raise exception 'Data da NF/recibo e data do crédito são obrigatórias (bTpVQ)' using errcode = '23502';
  end if;

  -- saldo de cada conta, sob a RLS de quem chama (trava as contas: baixa concorrente espera)
  perform 1 from public.contas_receber c where c.id = any(p_contas) for update;

  select count(*), count(*) filter (where s.saldo > 0), coalesce(sum(s.saldo), 0),
         count(distinct s.fornecedor_id), min(s.fornecedor_id::text)::uuid
    into v_achadas, v_abertas, v_total, v_fornec, v_forn_id
  from (
    select c.fornecedor_id,
           c.valor_comissao - coalesce((select sum(b.valor) from public.baixas b
                                        where b.conta_receber_id = c.id
                                          and not exists (select 1 from public.estornos e where e.baixa_id = b.id)), 0)
             as saldo
    from public.contas_receber c
    where c.id = any(p_contas) and c.cancelada_em is null
  ) s;
  if v_achadas <> (select count(distinct x) from unnest(p_contas) x) then
    raise exception 'Conta inexistente, cancelada ou sem acesso na seleção' using errcode = 'P0002';
  end if;
  if v_abertas <> v_achadas then
    raise exception 'Há conta já recebida na seleção' using errcode = '55000';
  end if;

  if p_gerar_recibo then
    if v_fornec <> 1 then
      raise exception 'Um recibo declara contas de UM fornecedor' using errcode = '23514';
    end if;
    insert into public.recibos (fornecedor_id, endereco_fornecedor_id, valor_total, emitido_por)
    values (v_forn_id, p_recibo_endereco, v_total, auth.uid())
    returning id, numero into v_recibo, v_recibo_num;
  end if;

  -- baixa pelo SALDO de cada conta (bTpVQ / bTrPO)
  insert into public.baixas
    (conta_receber_id, valor, dt_credito, nf_megabox_numero, dt_nf_megabox, nf_megabox_path,
     usuario_id, recibo_id, criado_por)
  select c.id,
         c.valor_comissao - coalesce((select sum(b.valor) from public.baixas b
                                      where b.conta_receber_id = c.id
                                        and not exists (select 1 from public.estornos e where e.baixa_id = b.id)), 0),
         p_dt_credito,
         case when v_recibo is not null then v_recibo_num::text else p_nf_numero end,  -- bTrPO
         p_dt_nf, p_nf_path,
         auth.uid(), v_recibo, auth.uid()
  from public.contas_receber c
  where c.id = any(p_contas) and c.cancelada_em is null;

  return v_recibo;
end $$;

comment on function public.fn_baixar_contas_receber(uuid[], date, date, text, text, boolean, uuid) is
  'Baixa em lote numa transação (bTpVQ com NF / bTrPJ com recibo). Cada conta baixa o SALDO. Com '
  'recibo: número por sequence, valor = soma das comissões (D14), um fornecedor só. Devolve o id '
  'do recibo (ou nulo).';

-- ------------------------------------------------------------------ fn_registrar_cobranca
create function public.fn_registrar_cobranca(
  p_contas              uuid[],
  p_endereco_fornecedor uuid,
  p_contato             uuid default null
)
  returns public.cobrancas
  language plpgsql
  security invoker
  set search_path = ''
as $$
declare
  v_forn uuid;
  v_cob  public.cobrancas;
  v_ok   integer;
begin
  select e.grupo_id into v_forn from public.enderecos_clifor e where e.id = p_endereco_fornecedor;
  if v_forn is null then
    raise exception 'Filial do fornecedor não encontrada' using errcode = 'P0002';
  end if;

  select count(*) into v_ok
  from public.contas_receber c
  where c.id = any(p_contas) and c.fornecedor_id = v_forn and c.cancelada_em is null;
  if v_ok = 0 or v_ok <> (select count(distinct x) from unnest(p_contas) x) then
    raise exception 'Toda conta da cobrança tem de ser do fornecedor da filial escolhida' using errcode = '23514';
  end if;

  insert into public.cobrancas (fornecedor_id, endereco_fornecedor_id, contato_id, criado_por)
  values (v_forn, p_endereco_fornecedor, p_contato, auth.uid())
  returning * into v_cob;

  insert into public.cobranca_contas (cobranca_id, conta_receber_id, criado_por)
  select v_cob.id, x, auth.uid() from (select distinct unnest(p_contas) as x) s;

  return v_cob;
end $$;

comment on function public.fn_registrar_cobranca(uuid[], uuid, uuid) is
  'Cobrança (bTpUa/bTpUb) numa transação: número por sequence, fornecedor DERIVADO da filial, '
  'todas as CRs desse fornecedor (D14). O PDF e o e-mail são da server action.';

revoke execute on function public.fn_valor_parcela(numeric, integer, integer)           from public, anon;
revoke execute on function public.fn_vencimento_conta_pagar(date)                       from public, anon;
revoke execute on function public.fn_percentual_comissao_vendedor(uuid, date)           from public, anon;
revoke execute on function public.fn_gerar_contas_receber(uuid, smallint[])             from public, anon;
revoke execute on function public.fn_gerar_conta_pagar(uuid, numeric, date)             from public, anon;
revoke execute on function public.fn_confirmar_entrega(uuid, date, smallint[], boolean) from public, anon;
revoke execute on function public.fn_reequilibrar_parcelas(uuid, text)                  from public, anon;
revoke execute on function public.fn_baixar_contas_receber(uuid[], date, date, text, text, boolean, uuid) from public, anon;
revoke execute on function public.fn_registrar_cobranca(uuid[], uuid, uuid)             from public, anon;

grant execute on function public.fn_valor_parcela(numeric, integer, integer)           to authenticated, service_role;
grant execute on function public.fn_vencimento_conta_pagar(date)                       to authenticated, service_role;
grant execute on function public.fn_percentual_comissao_vendedor(uuid, date)           to authenticated, service_role;
grant execute on function public.fn_gerar_contas_receber(uuid, smallint[])             to authenticated, service_role;
grant execute on function public.fn_gerar_conta_pagar(uuid, numeric, date)             to authenticated, service_role;
grant execute on function public.fn_confirmar_entrega(uuid, date, smallint[], boolean) to authenticated, service_role;
grant execute on function public.fn_reequilibrar_parcelas(uuid, text)                  to authenticated, service_role;
grant execute on function public.fn_baixar_contas_receber(uuid[], date, date, text, text, boolean, uuid) to authenticated, service_role;
grant execute on function public.fn_registrar_cobranca(uuid[], uuid, uuid)             to authenticated, service_role;


-- =====================================================================================
-- 8. VIEWS (security_invoker — respeitam a RLS das tabelas; nunca definer, 004)
-- =====================================================================================
create view public.v_contas_receber
with (security_invoker = true) as
select c.id,
       c.entrega_id,
       c.pedido_id,
       p.numero                 as pedido_numero,
       c.cotacao_id,
       c.proposta_id,
       c.orcamento_fornecedor_id,
       c.cliente_id,
       c.fornecedor_id,
       c.vendedor_id,
       o.endereco_origem_id,
       o.endereco_destino_id,
       o.produto_id,
       e.qtd,
       e.valor_venda_bruto_unit as valor_unit,
       c.parcela,
       c.parcelas_total,
       c.prazo_id,
       c.valor_total,
       c.valor_comissao,
       coalesce(b.baixado, 0)                    as valor_baixado,
       c.valor_comissao - coalesce(b.baixado, 0) as saldo,
       b.ultima_dt_baixa,
       b.ultima_dt_credito,
       b.ultima_nf_megabox,
       b.ultimo_recibo_id,
       c.dt_vencimento,
       e.dt_pedido,
       e.dt_prev_entrega,
       e.dt_entrega,
       e.nf_fornecedor_numero,
       e.dt_emissao_nf,
       c.status_id,
       (c.status_id = 1 and c.cancelada_em is null
        and c.dt_vencimento < (now() at time zone 'America/Sao_Paulo')::date) as vencida,
       c.arquivado,
       c.cancelada_em,
       c.motivo_altera_comissao,
       c.criado_em
from public.contas_receber c
join public.entregas e              on e.id = c.entrega_id
join public.pedidos p               on p.id = c.pedido_id
join public.orcamentos_fornecedor o on o.id = c.orcamento_fornecedor_id
left join lateral (
  select sum(bx.valor)               as baixado,
         max(bx.dt_baixa)            as ultima_dt_baixa,
         max(bx.dt_credito)          as ultima_dt_credito,
         max(bx.nf_megabox_numero)   as ultima_nf_megabox,
         (array_agg(bx.recibo_id order by bx.criado_em desc))[1] as ultimo_recibo_id
  from public.baixas bx
  where bx.conta_receber_id = c.id
    and not exists (select 1 from public.estornos s where s.baixa_id = bx.id)
) b on true;

comment on view public.v_contas_receber is
  'A lista do financeiro (financeiro.md §9.4 vw_contas_receber_lista): a CR + o que era cópia da '
  'entrega (D7) + baixado/saldo das baixas ativas + vencida. security_invoker.';

create view public.v_contas_pagar
with (security_invoker = true) as
select c.id,
       c.origem,
       c.entrega_id,
       c.meta_fechada_id,
       c.pedido_id,
       p.numero                 as pedido_numero,
       c.cliente_id,
       c.fornecedor_id,
       c.vendedor_id,
       e.qtd,
       e.dt_entrega,
       e.nf_fornecedor_numero,
       c.valor_base,
       c.percentual,
       c.valor_comissao,
       coalesce(b.pago, 0)                    as valor_pago,
       c.valor_comissao - coalesce(b.pago, 0) as saldo,
       b.ultima_dt_baixa,
       c.dt_vencimento,
       c.status_id,
       (c.status_id = 3 and c.cancelada_em is null
        and c.dt_vencimento < (now() at time zone 'America/Sao_Paulo')::date) as vencida,
       c.arquivado,
       c.cancelada_em,
       c.motivo_altera_comissao,
       c.criado_em
from public.contas_pagar c
left join public.entregas e on e.id = c.entrega_id
left join public.pedidos p  on p.id = c.pedido_id
left join lateral (
  select sum(bx.valor) as pago, max(bx.dt_baixa) as ultima_dt_baixa
  from public.baixas bx
  where bx.conta_pagar_id = c.id
    and not exists (select 1 from public.estornos s where s.baixa_id = bx.id)
) b on true;

comment on view public.v_contas_pagar is
  'Lista de contas a pagar (vw_contas_pagar_lista): a CP + dados da entrega (quando de entrega) + '
  'pago/saldo. security_invoker: a RLS de contas_pagar (sigilo por vendedor) vale aqui.';

create view public.v_conferencia_comissao_entrega
with (security_invoker = true) as
select e.id                                         as entrega_id,
       e.valor_comissao                             as comissao_entrega,
       sum(c.valor_comissao)                        as soma_parcelas,
       e.valor_comissao - sum(c.valor_comissao)     as diferenca_comissao,
       e.valor_venda_bruto                          as venda_entrega,
       sum(c.valor_total)                           as soma_venda_parcelas,
       e.valor_venda_bruto - sum(c.valor_total)     as diferenca_venda
from public.entregas e
join public.contas_receber c on c.entrega_id = e.id and c.cancelada_em is null
group by e.id, e.valor_comissao, e.valor_venda_bruto;

comment on view public.v_conferencia_comissao_entrega is
  'Substitui o cabeçalho vermelho "Comissão Unit" (reusables §5.6): diferença entre a entrega e a '
  'soma das parcelas abertas. Diferente de zero = a entrega mudou depois das parcelas (D4) → '
  'fn_reequilibrar_parcelas.';

revoke all on public.v_contas_receber              from anon;
revoke all on public.v_contas_pagar                from anon;
revoke all on public.v_conferencia_comissao_entrega from anon;
grant select on public.v_contas_receber              to authenticated;
grant select on public.v_contas_pagar                to authenticated;
grant select on public.v_conferencia_comissao_entrega to authenticated;


-- =====================================================================================
-- 9. TRIGGERS
-- =====================================================================================
create trigger trg_contas_receber_derivados
  before insert or update on public.contas_receber
  for each row execute function public.fn_conta_receber_derivados();
create constraint trigger trg_contas_receber_rateio
  after insert or delete or update of valor_comissao, valor_total, cancelada_em on public.contas_receber
  deferrable initially deferred
  for each row execute function public.fn_valida_rateio_cr();

create trigger trg_contas_pagar_derivados
  before insert or update on public.contas_pagar
  for each row execute function public.fn_conta_pagar_derivados();
create trigger trg_contas_pagar_vinculos
  after insert or update of cancelada_em on public.contas_pagar
  for each row execute function public.fn_conta_pagar_vinculos();

create trigger trg_baixas_antes
  before insert on public.baixas
  for each row execute function public.fn_baixa_antes();
create trigger trg_baixas_conta
  after insert on public.baixas
  for each row execute function public.fn_baixa_atualiza_conta();
create constraint trigger trg_baixas_recibo
  after insert or update of recibo_id, valor on public.baixas
  deferrable initially deferred
  for each row execute function public.fn_valida_recibo();

create trigger trg_estornos_antes
  before insert on public.estornos
  for each row execute function public.fn_estorno_antes();
create trigger trg_estornos_conta
  after insert on public.estornos
  for each row execute function public.fn_baixa_atualiza_conta();

create trigger trg_recibos_antes
  before insert on public.recibos
  for each row execute function public.fn_recibo_antes();
create constraint trigger trg_recibos_valor
  after insert or update of valor_total on public.recibos
  deferrable initially deferred
  for each row execute function public.fn_valida_recibo();

create trigger trg_cobranca_contas_fornecedor
  before insert or update on public.cobranca_contas
  for each row execute function public.fn_cobranca_conta_fornecedor();

create trigger trg_contas_receber_alterado before update on public.contas_receber
  for each row execute function public.fn_set_alterado();
create trigger trg_contas_pagar_alterado   before update on public.contas_pagar
  for each row execute function public.fn_set_alterado();
create trigger trg_baixas_alterado         before update on public.baixas
  for each row execute function public.fn_set_alterado();
create trigger trg_estornos_alterado       before update on public.estornos
  for each row execute function public.fn_set_alterado();
create trigger trg_cobrancas_alterado      before update on public.cobrancas
  for each row execute function public.fn_set_alterado();
create trigger trg_recibos_alterado        before update on public.recibos
  for each row execute function public.fn_set_alterado();

-- Dinheiro: trilha completa (02 §3.1; reusables §8.4.7 "quem alterou o quê")
create trigger trg_contas_receber_auditoria after insert or update or delete on public.contas_receber
  for each row execute function public.fn_auditoria();
create trigger trg_contas_pagar_auditoria   after insert or update or delete on public.contas_pagar
  for each row execute function public.fn_auditoria();
create trigger trg_baixas_auditoria         after insert or update or delete on public.baixas
  for each row execute function public.fn_auditoria();
create trigger trg_estornos_auditoria       after insert or update or delete on public.estornos
  for each row execute function public.fn_auditoria();
create trigger trg_cobrancas_auditoria      after insert or update or delete on public.cobrancas
  for each row execute function public.fn_auditoria();
create trigger trg_recibos_auditoria        after insert or update or delete on public.recibos
  for each row execute function public.fn_auditoria();


-- =====================================================================================
-- 10. RLS E POLICIES (CLAUDE.md regra 3; 02 §7; D11)
-- =====================================================================================
alter table public.cobrancas            enable row level security;
alter table public.recibos              enable row level security;
alter table public.contas_receber       enable row level security;
alter table public.contas_pagar         enable row level security;
alter table public.conta_pagar_entregas enable row level security;
alter table public.baixas               enable row level security;
alter table public.estornos             enable row level security;
alter table public.cobranca_contas      enable row level security;

revoke all on table public.cobrancas            from anon;
revoke all on table public.recibos              from anon;
revoke all on table public.contas_receber       from anon;
revoke all on table public.contas_pagar         from anon;
revoke all on table public.conta_pagar_entregas from anon;
revoke all on table public.baixas               from anon;
revoke all on table public.estornos             from anon;
revoke all on table public.cobranca_contas      from anon;
revoke all on sequence public.seq_cobranca_numero from anon;
revoke all on sequence public.seq_recibo_numero   from anon;

-- D8: dinheiro não se apaga pelo cliente; baixa e estorno são fatos imutáveis
revoke delete, truncate         on table public.contas_receber from authenticated;
revoke delete, truncate         on table public.contas_pagar   from authenticated;
revoke update, delete, truncate on table public.baixas         from authenticated;
revoke update, delete, truncate on table public.estornos       from authenticated;
revoke delete, truncate         on table public.cobrancas      from authenticated;
revoke delete, truncate         on table public.recibos        from authenticated;

-- o default de numero usa nextval: quem insere precisa de USAGE
grant usage on sequence public.seq_cobranca_numero to authenticated;
grant usage on sequence public.seq_recibo_numero   to authenticated;

-- ------------------------------------------------------------------------ contas_receber
-- Quem tem a página financeiro E enxerga a entrega (a policy entregas_leitura_financeiro abaixo:
-- hierarquia ≤ 2, vendedor ou substituto — 02 §7.3).
create policy contas_receber_leitura on public.contas_receber
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and exists (select 1 from public.entregas e where e.id = entrega_id)
  );
create policy contas_receber_insercao on public.contas_receber
  for insert to authenticated
  with check (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and exists (select 1 from public.entregas e where e.id = entrega_id)
  );
create policy contas_receber_alteracao on public.contas_receber
  for update to authenticated
  using (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and exists (select 1 from public.entregas e where e.id = entrega_id)
  )
  with check (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and exists (select 1 from public.entregas e where e.id = entrega_id)
  );

comment on policy contas_receber_leitura on public.contas_receber is
  'Página financeiro + a entrega visível (D11). Sem policy de DELETE e com o DELETE revogado (D8).';

-- -------------------------------------------------------------------------- contas_pagar
-- SIGILO: comissão do vendedor. Lê hierarquia ≤ 2 ou o próprio; escreve só hierarquia ≤ 2.
create policy contas_pagar_leitura on public.contas_pagar
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and ((select public.fn_hierarquia()) <= 2 or vendedor_id = (select auth.uid()))
  );
create policy contas_pagar_insercao on public.contas_pagar
  for insert to authenticated
  with check (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and (select public.fn_hierarquia()) <= 2
  );
create policy contas_pagar_alteracao on public.contas_pagar
  for update to authenticated
  using (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and (select public.fn_hierarquia()) <= 2
  )
  with check (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and (select public.fn_hierarquia()) <= 2
  );

comment on policy contas_pagar_leitura on public.contas_pagar is
  'Comissão do vendedor é sigilosa: hierarquia ≤ 2 ou o próprio (02 §7.3). Escrita só hierarquia '
  '≤ 2 (D11): ninguém abaixo de Gerente cria, altera ou baixa a própria comissão. A 011 soma a '
  'escrita pela página metas para a CP de origem meta.';

-- ------------------------------------------------------------------ conta_pagar_entregas
create policy conta_pagar_entregas_leitura on public.conta_pagar_entregas
  for select to authenticated
  using (exists (select 1 from public.contas_pagar cp where cp.id = conta_pagar_id));
create policy conta_pagar_entregas_escrita on public.conta_pagar_entregas
  for all to authenticated
  using (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and (select public.fn_hierarquia()) <= 2
  )
  with check (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and (select public.fn_hierarquia()) <= 2
  );

-- -------------------------------------------------------------------------------- baixas
create policy baixas_leitura on public.baixas
  for select to authenticated
  using (
    (conta_receber_id is not null
     and exists (select 1 from public.contas_receber c where c.id = conta_receber_id))
    or (conta_pagar_id is not null
        and exists (select 1 from public.contas_pagar c where c.id = conta_pagar_id))
  );
create policy baixas_insercao on public.baixas
  for insert to authenticated
  with check (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and (
      (conta_receber_id is not null
       and exists (select 1 from public.contas_receber c where c.id = conta_receber_id))
      or (conta_pagar_id is not null
          and (select public.fn_hierarquia()) <= 2
          and exists (select 1 from public.contas_pagar c where c.id = conta_pagar_id))
    )
  );

comment on policy baixas_insercao on public.baixas is
  'Baixa de CR: quem pode escrever a CR. Baixa de CP: só hierarquia ≤ 2 (D11). Sem UPDATE/DELETE: '
  'fato imutável; desfazer é estorno.';

-- ------------------------------------------------------------------------------ estornos
create policy estornos_leitura on public.estornos
  for select to authenticated
  using (exists (select 1 from public.baixas b where b.id = baixa_id));
create policy estornos_insercao on public.estornos
  for insert to authenticated
  with check (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and (select public.fn_hierarquia()) <= 1
    and exists (select 1 from public.baixas b where b.id = baixa_id)
  );

comment on policy estornos_insercao on public.estornos is
  'Estornar é do Diretor (reusables §9.3 estornarBaixa; hoje qualquer logado estorna, §7).';

-- ----------------------------------------------------------------------------- cobrancas
create policy cobrancas_leitura on public.cobrancas
  for select to authenticated
  using ((select public.fn_pode_acessar_pagina('financeiro')));
create policy cobrancas_insercao on public.cobrancas
  for insert to authenticated
  with check ((select public.fn_pode_acessar_pagina('financeiro')));
create policy cobrancas_alteracao on public.cobrancas
  for update to authenticated
  using ((select public.fn_pode_acessar_pagina('financeiro')))
  with check ((select public.fn_pode_acessar_pagina('financeiro')));

-- ------------------------------------------------------------------------ cobranca_contas
create policy cobranca_contas_leitura on public.cobranca_contas
  for select to authenticated
  using (
    exists (select 1 from public.cobrancas cb where cb.id = cobranca_id)
    and exists (select 1 from public.contas_receber c where c.id = conta_receber_id)
  );
create policy cobranca_contas_escrita on public.cobranca_contas
  for all to authenticated
  using (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and exists (select 1 from public.contas_receber c where c.id = conta_receber_id)
  )
  with check (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and exists (select 1 from public.contas_receber c where c.id = conta_receber_id)
  );

-- ------------------------------------------------------------------------------- recibos
create policy recibos_leitura on public.recibos
  for select to authenticated
  using ((select public.fn_pode_acessar_pagina('financeiro')));
create policy recibos_insercao on public.recibos
  for insert to authenticated
  with check ((select public.fn_pode_acessar_pagina('financeiro')));
create policy recibos_alteracao on public.recibos
  for update to authenticated
  using ((select public.fn_pode_acessar_pagina('financeiro')))
  with check ((select public.fn_pode_acessar_pagina('financeiro')));

comment on policy recibos_alteracao on public.recibos is
  'UPDATE existe para gravar arquivo_path depois do PDF. O valor é conferido no commit (D14).';

-- ------------------------------------ ADITIVAS: a página financeiro nas tabelas da 007–009
-- Permissivas: combinam por OR com as policies existentes, que ficam intactas (D13).
-- Sem ciclo: as policies de entregas não consultam cotacoes nem pedidos.
create policy entregas_leitura_financeiro on public.entregas
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and ((select public.fn_hierarquia()) <= 2
         or vendedor_id            = (select auth.uid())
         or vendedor_substituto_id = (select auth.uid()))
  );
create policy entregas_alteracao_financeiro on public.entregas
  for update to authenticated
  using (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and ((select public.fn_hierarquia()) <= 2
         or vendedor_id            = (select auth.uid())
         or vendedor_substituto_id = (select auth.uid()))
  )
  with check (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and ((select public.fn_hierarquia()) <= 2
         or vendedor_id            = (select auth.uid())
         or vendedor_substituto_id = (select auth.uid()))
  );
create policy entrega_arquivos_escrita_financeiro on public.entrega_arquivos
  for all to authenticated
  using (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and exists (select 1 from public.entregas e where e.id = entrega_id)
  )
  with check (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and exists (select 1 from public.entregas e where e.id = entrega_id)
  );
create policy cotacoes_leitura_financeiro on public.cotacoes
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and exists (select 1 from public.entregas e where e.cotacao_id = cotacoes.id)
  );
create policy pedidos_leitura_financeiro on public.pedidos
  for select to authenticated
  using (
    (select public.fn_pode_acessar_pagina('financeiro'))
    and exists (select 1 from public.entregas e where e.pedido_id = pedidos.id)
  );

comment on policy entregas_leitura_financeiro on public.entregas is
  'Soma à 009 a página financeiro, com a MESMA regra de dono (hierarquia ≤ 2, vendedor ou '
  'substituto). Leitura, e UPDATE por entregas_alteracao_financeiro (confirmar, NF, boletos do '
  'pop.AnexaNf). Criar/apagar entrega continua só pela página vendas.';
comment on policy cotacoes_leitura_financeiro on public.cotacoes is
  'Só LEITURA, das cotações que têm entrega visível: fn_entrega_derivados relê a cotação a cada '
  'UPDATE de entrega (D13). Itens, orçamentos e propostas herdam pelo exists da 007/008.';
comment on policy pedidos_leitura_financeiro on public.pedidos is
  'Só LEITURA, dos pedidos que têm entrega visível: número do pedido na lista e prazos '
  'negociados para gerar as parcelas (D13). pedido_prazos herda pelo exists da 008.';


-- =====================================================================================
-- FIM da 010_financeiro.sql
-- =====================================================================================
-- CONFERÊNCIA
--   8 tabelas, 8 com RLS, 8 com `revoke all ... from anon`; 2 sequences sem anon.
--   Policies novas: 20 nas tabelas desta migration (nenhuma de DELETE em dinheiro) + 5
--   ADITIVAS (entregas leitura/alteração, entrega_arquivos escrita, cotacoes e pedidos leitura).
--   2 colunas novas em email_outbox (cobranca_id, recibo_id), com índice.
--   Dinheiro: numeric(14,2); percentual numeric(7,4) em fração; nenhum float.
--   FKs indexadas: todas.
--   Funções: 3 de cálculo + 6 de negócio, security invoker, execute para authenticated e
--   service_role, revogado de anon; 10 de trigger, execute revogado. Nenhuma security definer.
--   3 views (security_invoker = true).
--   Triggers: 5 de derivados/trava, 3 constraint triggers adiadas (rateio, recibo ×2),
--   2 de status por baixa/estorno, 6 fn_set_alterado, 6 fn_auditoria.
--   Nenhum seed. Nenhum segredo.
-- =====================================================================================
