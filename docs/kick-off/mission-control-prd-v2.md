# Mission Control — PRD v2
**Produto:** Mission Control para OpenClaw  
**Autor:** Bruno  
**Versão:** 2.0  
**Status:** Rascunho refinado  
**Data:** Fevereiro 2026

---

## 1. Visão e Objetivo

Mission Control é um painel web centralizado que serve como interface de comando para o ecossistema OpenClaw. O objetivo é eliminar o caos de ferramentas dispersas (Telegram, Slack, Discord, notas soltas, terminal) e reunir gestão de tarefas, pipelines de conteúdo, cronogramas, memória de agentes e observabilidade em um único hub — rodando localmente, sem dependência de SaaS terceiros.

**Proposta de valor em uma frase:** *Dê ao Bruno e aos seus agentes OpenClaw um lugar único para criar, acompanhar e completar trabalho — com visibilidade total e zero overhead de configuração.*

---

## 2. Escopo e Faseamento

A maior armadilha de projetos como este é construir tudo de uma vez e não terminar nada. O escopo abaixo separa com clareza o que entra no MVP e o que vai para fases posteriores.

### Fase 1 — MVP (o que será construído primeiro)

| Módulo | Descrição resumida |
|---|---|
| Dashboard | Indicadores em tempo real: tarefas, sessões ativas, custo, feed de atividade |
| Tarefas (Kanban) | Quadro Kanban com colunas configuráveis, criação/edição de tarefas, atribuição a agentes |
| Agentes | Lista de agentes com status, papel, última atividade e botão de ação rápida |
| Agenda | Calendário semanal/mensal com eventos manuais e cron jobs do OpenClaw |
| Observabilidade básica | Sessões ativas, tokens consumidos, custo acumulado, logs de execução |

### Fase 2 — Pós-MVP

| Módulo | Justificativa para esperar |
|---|---|
| Pipeline de Conteúdo (YouTube) | Depende de validação do Kanban base; é um Kanban especializado |
| Memória e Diário | Requer integração mais profunda com a memória do OpenClaw |
| Projetos e Documentos | Agrupamento de tarefas; útil mas não bloqueante no início |
| Approvals | Depende da integração Telegram/Slack/Discord estar estável |

### Fase 3 — Futuro

| Módulo | Justificativa para esperar |
|---|---|
| Council | Alta complexidade; fluxo de deliberação multi-agente é experimental |
| Roteamento de LLM | Otimização; não é necessário para o produto funcionar |
| Agendador inteligente (run-if-idle etc.) | Primitivas avançadas; o cron simples resolve o MVP |
| Suporte a voz | Nice-to-have; aumenta significativamente a complexidade |
| Design de squads via linguagem natural | Inovação; requer validação dos módulos anteriores |

---

## 3. Personas

### Bruno (usuário primário)
Engenheiro de software trabalhando de casa. Constrói SaaS, gerencia um canal no YouTube e automatiza rotinas. Acessa o Mission Control via browser no desktop. Não tem paciência para configuração — quer uma ferramenta que funcione na primeira execução.

**Necessidade central:** Ver o que está acontecendo, criar tarefas rapidamente e confiar que os agentes estão executando o que foram designados.

### Agentes OpenClaw (TARS, CASE, KIPP, PLEX, ECHO)
Instâncias autônomas que executam tarefas específicas. Lêem o estado do Mission Control via API, atualizam status de tarefas, adicionam entradas ao feed de atividade e, em alguns casos, criam novas tarefas autonomamente.

**Necessidade central:** API clara e previsível para ler contexto e reportar progresso sem depender do Bruno estar online.

### Colaboradores humanos (fase 2+)
Colegas ou amigos que participam de canais de Telegram/Slack/Discord. Precisam aprovar conteúdo ou fornecer feedback sem precisar acessar o código ou o terminal.

---

## 4. Time de Agentes

| Nome | Papel | Projetos / Contexto |
|---|---|---|
| TARS | Chief of Staff | Orquestração geral, priorização, gestão de agenda |
| CASE | Tech Lead Engineer | Meu Flip |
| KIPP | Tech Lead Engineer | Meu Foco |
| PLEX | Software Engineer | Tarefas de engenharia gerais, suporte a CASE e KIPP |
| ECHO | Social Media Manager | Canal do YouTube, distribuição de conteúdo |

Todos os agentes se identificam por esse nome nas entradas do feed de atividade, nos cards de tarefas e nos logs de sessão. O campo `agent_id` no banco usa o nome em minúsculas como identificador (ex.: `tars`, `case`, `kipp`, `plex`, `echo`).

---

## 5. Requisitos Funcionais — Fase 1 MVP

### 5.1 Dashboard

**Descrição:** Tela inicial exibida ao abrir o Mission Control. Deve dar ao Bruno uma leitura imediata do estado do sistema sem precisar navegar para outras telas.

**Componentes obrigatórios:**

- **Indicadores de tarefas:** total de tarefas ativas, tarefas em progresso, tarefas concluídas na semana atual e tarefas em atraso (data de vencimento passada e status ≠ Done).
- **Indicadores de sessões:** número de sessões OpenClaw ativas no momento, modelo em uso por sessão (ex.: Claude Sonnet, Opus, modelo local), tokens consumidos na sessão e custo acumulado em USD.
- **Custo semanal:** total gasto em tokens na semana corrente com barra de progresso em relação a um limite configurável (ex.: USD 20/semana).
- **Feed de atividade:** lista cronológica reversa das últimas 50 ações dos agentes. Cada entrada mostra: timestamp, nome do agente, tipo de ação (tarefa criada, tarefa concluída, mensagem enviada, cron executado, erro) e texto descritivo. Entradas de erro devem ser destacadas visualmente.
- **Próximas execuções:** os 5 próximos cron jobs agendados com nome, horário e agente responsável.

**Critérios de aceite:**
- O dashboard carrega em menos de 2 segundos numa conexão local.
- Os indicadores de sessão atualizam via Server-Sent Events (SSE) sem necessidade de reload manual.
- O feed de atividade exibe as entradas mais recentes ao topo e pode ser rolado; novas entradas aparecem em tempo real.
- Clicar em qualquer tarefa no feed navega para o card correspondente no Kanban.

---

### 5.2 Gestão de Tarefas (Kanban)

**Descrição:** Quadro visual para criar, organizar e acompanhar tarefas. É o módulo mais utilizado no dia a dia.

**Colunas padrão (configuráveis):** Backlog → In Progress → Review → Done. O usuário pode renomear, reordenar ou adicionar novas colunas.

**Card de tarefa — campos:**

| Campo | Tipo | Obrigatório |
|---|---|---|
| Título | Texto curto | Sim |
| Descrição | Markdown | Não |
| Status | Coluna atual | Automático |
| Prioridade | Alta / Média / Baixa | Não (padrão: Média) |
| Data de vencimento | Data | Não |
| Tags | Multi-select livre | Não |
| Agente responsável | Select (agentes cadastrados + "Eu") | Não |
| Projeto | Select (projetos cadastrados) | Não |
| Criado por | Automático (usuário ou agente) | Automático |
| Criado em | Timestamp | Automático |

**Comportamentos obrigatórios:**
- Arrastar card entre colunas atualiza o status imediatamente via API (otimistic update + confirmação do servidor).
- Criar tarefa por teclado: apertar `N` em qualquer tela abre modal de criação rápida com apenas título obrigatório.
- Tarefas com data de vencimento aparecem automaticamente no calendário (módulo 5.4).
- Filtros: por agente responsável, por projeto, por prioridade e por intervalo de datas. Filtros podem ser combinados.
- Busca por texto no título e descrição das tarefas.
- Tarefas podem ser criadas pela API (para os agentes) com os mesmos campos.

**Critérios de aceite:**
- Arrastar um card atualiza o banco em menos de 500ms; em caso de falha, o card retorna à posição original com mensagem de erro.
- A criação de tarefa via teclado (`N`) funciona mesmo quando o foco está em campos de texto fora de inputs.
- Agentes conseguem criar e atualizar tarefas via `POST /api/tasks` e `PATCH /api/tasks/:id` com autenticação por token.

---

### 5.3 Gerenciamento de Agentes

**Descrição:** Diretório de todos os agentes OpenClaw registrados. Serve como ponto de partida para entender quem está disponível e o que cada um faz.

**Card de agente — campos:**

| Campo | Descrição |
|---|---|
| Nome | ex.: TARS, CASE, KIPP, PLEX, ECHO |
| Função / Papel | ex.: Chief of Staff, Tech Lead Engineer, Software Engineer, Social Media Manager |
| Descrição | Resumo do que o agente faz e quando acioná-lo |
| Sinal de entrada | O que o agente espera receber (ex.: "URL de artigo + instrução") |
| Saída esperada | O que o agente produz (ex.: "Resumo em Markdown + tarefa criada") |
| Status | Online / Offline / Em execução |
| Última atividade | Timestamp da última ação registrada no feed |
| Tarefas ativas | Número de tarefas atribuídas com status ≠ Done |

**Ações disponíveis por card:**
- **Enviar comando:** abre modal de texto livre que envia uma mensagem direta ao agente via API do OpenClaw.
- **Ver histórico:** exibe as últimas 20 entradas do feed de atividade filtradas para aquele agente.
- **Editar:** permite alterar nome, papel, descrição e sinais de entrada/saída.

**Ações globais:**
- Adicionar novo agente: formulário com os campos acima + campo para o prompt inicial (SOUL.md básico).
- Arquivar agente: remove da listagem ativa sem deletar o histórico.

**Critérios de aceite:**
- O status do agente (Online/Offline/Em execução) reflete o estado real via polling a cada 30 segundos ou via SSE se disponível.
- Enviar um comando registra a ação no feed de atividade com status "enviado" e atualiza para "recebido" quando o agente confirmar.

---

### 5.4 Agenda e Cronogramas

**Descrição:** Calendário unificado mostrando eventos manuais, tarefas com data de vencimento e cron jobs programados para os agentes.

**Visualizações:** semanal e mensal. A visualização padrão é semanal.

**Tipos de entrada no calendário:**

| Tipo | Cor sugerida | Origem |
|---|---|---|
| Evento manual | Azul | Criado diretamente no calendário pelo usuário |
| Tarefa com vencimento | Laranja | Sincronizado do módulo de tarefas |
| Cron job | Verde | Cadastrado na lista de agendamentos |

**Criação de evento:**
- Clicar em qualquer slot do calendário abre modal com: título, data/hora de início, data/hora de fim (opcional), recorrência (sem recorrência, diária, semanal, mensal) e notas.

**Criação de cron job:**
- Formulário separado com: nome, expressão cron (ou seletor visual simplificado), agente responsável, comando/ação a executar e estado (ativo/pausado).
- Lista lateral com todos os cron jobs cadastrados, mostrando: nome, frequência, agente, próxima execução e botões de pausar/editar/excluir.

**Critérios de aceite:**
- Criar uma tarefa com data de vencimento no Kanban reflete no calendário em menos de 2 segundos sem reload.
- Alterar a data de um evento no calendário (drag) atualiza a data de vencimento da tarefa correspondente se houver.
- Cron jobs pausados aparecem em cinza no calendário e na lista.

---

### 5.5 Observabilidade Básica

**Descrição:** Painel dedicado a métricas de execução dos agentes e custos de tokens. Essencial para manter autonomia sem perder controle.

**Seções obrigatórias:**

**Sessões ativas:**
- Tabela com: ID da sessão, agente, modelo (Claude Opus, Sonnet, local etc.), tokens de entrada consumidos, tokens de saída consumidos, custo estimado em USD e duração.
- Atualização em tempo real via SSE.
- Botão para encerrar uma sessão manualmente.

**Consumo de tokens:**
- Gráfico de barras diário: tokens consumidos por dia nos últimos 7 dias, separados por agente.
- Indicador do total semanal vs. limite configurado, com alerta visual quando ultrapassar 80% do limite.

**Logs de execução:**
- Lista filtável por agente, por data e por nível (info, warn, error).
- Cada entrada: timestamp, agente, nível, mensagem.
- Entradas de erro expandem para mostrar o stack trace quando disponível.

**Critérios de aceite:**
- O custo estimado usa as tarifas configuradas por modelo (editáveis em Settings) e atualiza conforme os tokens são consumidos.
- Logs de erro não lidos são contados no badge do ícone de Observabilidade na navegação lateral.
- O histórico de logs persiste por 30 dias no banco local.

---

## 6. Arquitetura Técnica

### 6.1 Visão geral

```
[Browser] ──── HTTP/SSE ────▶ [API Server (Go + Chi)]
                                      │
                        ┌─────────────┼─────────────┐
                        ▼             ▼             ▼
                   [SQLite DB]   [OpenClaw API]  [Telegram/Slack/Discord Webhooks]
```

### 6.2 Front-end

**Framework:** Next.js 14+ com App Router.  
**Justificativa:** SSR quando necessário, suporte nativo a rotas de API, ecossistema maduro, fácil de ler e modificar pelos agentes (TypeScript + JSX bem formatado).

**Estilo:** Tailwind CSS. Sem componentes UI externos pesados — usar shadcn/ui seletivamente para não criar dependência de uma biblioteca de design.

**Estado global:** Zustand para estado de UI local (filtros, modais abertos). React Query para cache de dados do servidor com invalidação automática.

**SSE (tempo real):** hook `useEventSource` custom que se reconecta automaticamente em caso de queda.

**Regras de código para legibilidade por agentes:**
- Componentes em arquivos separados, máximo 200 linhas por arquivo.
- Nomes de variáveis descritivos; sem abreviações obscuras.
- Comentários em inglês nas funções públicas (para facilitar parsing por agentes).
- Sem CSS-in-JS; apenas classes Tailwind.

### 6.3 Back-end

**Runtime:** Go 1.22+.
**Framework de rotas:** Chi 5.x (leve, idiomático e integrado à stdlib `net/http`).
**Validação de payload:** `go-playground/validator`.
**SSE:** endpoint HTTP nativo via `net/http` em `/api/stream`.

**Estrutura de rotas da API:**

```
GET    /api/health
GET    /api/dashboard/summary
GET    /api/tasks               (com filtros via query params)
POST   /api/tasks
PATCH  /api/tasks/:id
DELETE /api/tasks/:id
GET    /api/agents
POST   /api/agents
PATCH  /api/agents/:id
POST   /api/agents/:id/command
GET    /api/events              (calendário)
POST   /api/events
PATCH  /api/events/:id
DELETE /api/events/:id
GET    /api/crons
POST   /api/crons
PATCH  /api/crons/:id
DELETE /api/crons/:id
GET    /api/sessions            (observabilidade)
POST   /api/sessions
PATCH  /api/sessions/:id
GET    /api/activity            (feed de atividade)
POST   /api/activity
PATCH  /api/activity/mark-read
GET    /api/settings
PATCH  /api/settings
GET    /api/stream              (SSE endpoint – dashboard em tempo real)
```

**Autenticação:** Bearer token simples para a API. O token é gerado na primeira inicialização e salvo em `.env`. Para acesso local via browser, o token é injetado automaticamente por cookie `httpOnly`. Suporte futuro a Tailscale e Cloudflare Access via header `Cf-Access-Authenticated-User-Email`.

**Agendamento de crons:** `robfig/cron/v3` para execução no processo do servidor. Cada disparo de cron registra uma entrada no feed de atividade e chama a skill correspondente do OpenClaw.

### 6.4 Banco de Dados

**Banco:** SQLite via `modernc.org/sqlite` (pure Go, sem CGO) para simplicidade de deploy (arquivo único, sem processo separado, backup trivial). Migrar para Postgres somente se houver necessidade de acesso concorrente de múltiplas máquinas.

**Esquema principal (simplificado):**

```sql
-- Tarefas
CREATE TABLE tasks (
  id TEXT PRIMARY KEY,           -- UUID v4
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL,          -- coluna do kanban
  priority TEXT DEFAULT 'medium',
  due_date TEXT,                 -- ISO 8601 date
  tags TEXT,                     -- JSON array
  agent_id TEXT REFERENCES agents(id),
  project_id TEXT REFERENCES projects(id),
  created_by TEXT NOT NULL,      -- 'user' ou agent_id
  created_at TEXT NOT NULL,      -- ISO 8601 datetime
  updated_at TEXT NOT NULL
);

-- Agentes
CREATE TABLE agents (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  description TEXT,
  input_signal TEXT,
  output_action TEXT,
  status TEXT DEFAULT 'offline',
  last_seen_at TEXT,
  archived_at TEXT
);

-- Eventos do calendário
CREATE TABLE events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  start_at TEXT NOT NULL,
  end_at TEXT,
  type TEXT NOT NULL,            -- 'manual' | 'task' | 'cron'
  task_id TEXT REFERENCES tasks(id),
  cron_id TEXT REFERENCES crons(id),
  recurrence TEXT,               -- 'daily' | 'weekly' | 'monthly' | null
  notes TEXT,
  created_at TEXT NOT NULL
);

-- Cron jobs
CREATE TABLE crons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  expression TEXT NOT NULL,      -- cron expression
  agent_id TEXT REFERENCES agents(id),
  command TEXT NOT NULL,
  active INTEGER DEFAULT 1,      -- 0 | 1
  last_run_at TEXT,
  next_run_at TEXT,
  created_at TEXT NOT NULL
);

-- Feed de atividade e logs
CREATE TABLE activity (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  type TEXT NOT NULL,            -- 'task_created' | 'task_done' | 'message_sent' | 'cron_ran' | 'error'
  message TEXT NOT NULL,
  metadata TEXT,                 -- JSON com detalhes extras
  level TEXT DEFAULT 'info',     -- 'info' | 'warn' | 'error'
  created_at TEXT NOT NULL
);

-- Sessões (consumo de tokens)
CREATE TABLE sessions (
  id TEXT PRIMARY KEY,
  agent_id TEXT REFERENCES agents(id),
  model TEXT NOT NULL,
  input_tokens INTEGER DEFAULT 0,
  output_tokens INTEGER DEFAULT 0,
  cost_usd REAL DEFAULT 0,
  started_at TEXT NOT NULL,
  ended_at TEXT
);
```

**Migrações:** Gerenciadas com `golang-migrate` + scripts SQL versionados em `/apps/api/migrations/*.sql`.

### 6.5 Integração com OpenClaw

O Mission Control expõe e consome uma interface clara com o OpenClaw via **skills personalizadas**:

**Skills que o OpenClaw expõe para o Mission Control consultar:**
- `sessions/list` — lista sessões ativas com tokens e custo
- `sessions/end/:id` — encerra uma sessão
- `agents/status/:id` — retorna status atual de um agente

**Skills que o Mission Control expõe para os agentes chamarem:**
- `missions/create_task` — cria uma tarefa (payload: título, descrição, prioridade, agente responsável, projeto)
- `missions/update_task` — atualiza campos de uma tarefa existente
- `missions/log_activity` — registra uma entrada no feed de atividade
- `missions/get_context` — retorna as tarefas ativas e o estado atual do dashboard para que o agente tenha contexto

Essas skills são chamadas via HTTP na porta local (ex.: `http://localhost:3001/api/...`) com o Bearer token do `.env`.

### 6.6 Deploy e Execução

- Execução local padrão: `./start.sh` inicia front-end na porta 3000 e back-end na porta 3001.
- Execução manual (desenvolvimento): `go run ./apps/api` para a API e `npm run dev` em `apps/web` para o front-end.
- Variáveis de ambiente em `.env` (porta, token de API, chaves de modelos, limite de custo semanal).
- Nenhuma chamada de rede para fora de `localhost` exceto para a API da Anthropic (tokens) e webhooks do Telegram/Slack/Discord quando configurados.
- Possibilidade de rodar atrás de Cloudflare Tunnel ou Tailscale para acesso remoto sem abrir porta no roteador.

---

## 7. Design e Experiência

### Princípios de design

- **Informação densa, não sobrecarregada.** O Mission Control é uma ferramenta de trabalho, não um app de consumo. Tabelas e listas compactas são preferíveis a layouts espaçosos.
- **Ações rápidas primeiro.** As ações mais frequentes (criar tarefa, aprovar, filtrar) devem ter atalho de teclado ou estar visíveis sem scroll.
- **Modo escuro por padrão.** Ambiente de trabalho noturno e de terminal.
- **Sem spinners desnecessários.** Usar optimistic updates com rollback em caso de erro.

### Navegação lateral
Ícones com label colapsável (modo compacto ao encolher). Seções: Dashboard, Tarefas, Agentes, Agenda, Observabilidade, Configurações.

### Paleta de cores (referência)
- Fundo principal: `#0f1117`
- Superfície de cards: `#1a1d27`
- Borda: `#2a2d3a`
- Destaque principal (azul): `#4f8ef7`
- Sucesso: `#22c55e`
- Aviso: `#f59e0b`
- Erro: `#ef4444`

---

## 8. Configurações (Settings)

Tela de configurações com as seguintes seções:

**Geral:**
- Nome do workspace
- Fuso horário

**API e Modelos:**
- Token de autenticação da API (visualizar/regenerar)
- Preços por modelo (tabela editável: modelo → custo por 1M tokens de input → custo por 1M tokens de output)

**Limites:**
- Limite de custo semanal (em USD) para alertas
- Número de dias de retenção de logs

**Integrações:**
- Webhook do Telegram (token do bot + chat ID)
- Webhook do Slack (URL do incoming webhook)
- Discord: token do bot + channel ID padrão

**Privacidade:**
- Modo demo (toggle): quando ativo, substitui nomes de clientes e valores financeiros por placeholders nos feeds e cards visíveis na tela.

---

## 9. Segurança e Privacidade

- Todo o dado fica no banco SQLite local; nenhuma informação sensível é enviada para fora da máquina exceto quando explicitamente configurado (webhooks Telegram/Slack/Discord).
- O Bearer token de API é obrigatório em todas as rotas (exceto `/health`). Tokens podem ser rotacionados sem reiniciar o servidor.
- O modo demo (seção 7) oculta dados sensíveis para gravações e transmissões.
- Não há autenticação multi-usuário no MVP. Acesso local é irrestrito dentro da rede. Para exposição externa, usar Cloudflare Access ou Tailscale como camada de autenticação.
- Logs de execução não armazenam conteúdo de mensagens por padrão; apenas metadados (tipo, agente, timestamp). Armazenamento de conteúdo completo pode ser habilitado em Settings com aviso explícito.

---

## 10. Métricas de Sucesso

### Métricas de uso (indicadores de adesão)
- Número de acessos ao Mission Control por dia.
- Número de tarefas criadas diretamente na interface vs. via chat/API de agentes.
- Número de cards movidos via drag vs. atualizados por agentes.

### Métricas de eficiência
- Taxa de conclusão semanal: tarefas concluídas / tarefas criadas na semana.
- Tempo médio entre criação e conclusão de tarefa por prioridade.
- Número de cron jobs executados com sucesso vs. com erro por semana.

### Métricas de custo
- Custo semanal de tokens total e por agente.
- Redução no uso de ferramentas pagas substituídas (Notion, Google Calendar, etc.).

### Indicador qualitativo
- O Bruno consegue planejar a semana inteira sem abrir uma ferramenta externa? (sim/não)

---

## 11. Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|---|---|---|---|
| Integração com OpenClaw muda breaking | Média | Alto | Skills versionadas; camada de adaptação no back-end |
| SQLite com travamento em writes concorrentes | Baixa | Médio | WAL mode habilitado; serializar writes críticos |
| Front-end fica complexo demais para agentes modificarem | Média | Médio | Manter componentes pequenos; documentar padrões no README |
| Custo de tokens explode sem perceber | Baixa | Alto | Alertas a 80% do limite; sessão com soft cap configurável |
| SSE instável em conexões ruins | Média | Baixo | Fallback para polling a cada 10s se SSE cair |

---

## 12. Critérios de "Pronto" para o MVP

O MVP está pronto quando:

1. Bruno consegue abrir o Mission Control no browser sem configuração manual além do `.env`.
2. É possível criar, mover e completar uma tarefa inteiramente pela interface.
3. Um agente OpenClaw consegue criar uma tarefa via API e ela aparece no Kanban em menos de 3 segundos.
4. O feed de atividade mostra as últimas ações em tempo real sem reload.
5. O calendário exibe tarefas com vencimento e cron jobs cadastrados.
6. O painel de sessões mostra consumo de tokens e custo acumulado das sessões ativas.
7. O modo demo oculta dados sensíveis ao ser ativado.

---

## 13. Próximos Passos

1. **Validar este PRD** — reler com foco nos critérios de aceite; identificar qualquer requisito ambíguo antes de escrever código.
2. **Configurar o repositório** — estrutura de pastas, `.env.example`, script `start.sh`, README com instruções de setup.
3. **Implementar o banco e a API** — esquema SQLite + rotas Chi com testes básicos (happy path de cada endpoint).
4. **Implementar o front-end em ordem de módulo:** Dashboard → Kanban → Agentes → Agenda → Observabilidade.
5. **Conectar ao OpenClaw** — implementar as skills de `missions/create_task` e `missions/log_activity` e validar o fluxo de ponta a ponta.
6. **Usar o Mission Control por 2 semanas no dia a dia** antes de passar para a Fase 2.
7. **Fase 2:** Pipeline de Conteúdo, Memória/Diário, Projetos/Documentos, Approvals.
