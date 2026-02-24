# Mission Control — Documento de Arquitetura Técnica
**Versão:** 1.1  
**Status:** Ativo  
**Audiência:** Bruno + Agentes (TARS, CASE, KIPP, PLEX, ECHO)  
**Última atualização:** Fevereiro 2026

> **Instrução para agentes:** Este documento é a fonte de verdade da arquitetura do Mission Control. Antes de criar ou modificar qualquer arquivo de código, consulte as seções relevantes aqui. Se uma decisão de arquitetura precisar mudar, atualize este documento primeiro e registre o motivo na seção de Changelog ao final.

---

## Índice

1. [Visão Geral da Arquitetura](#1-visão-geral-da-arquitetura)
2. [Diagrama de Componentes](#2-diagrama-de-componentes)
3. [Fluxos de Dados](#3-fluxos-de-dados)
4. [Estrutura de Pastas](#4-estrutura-de-pastas)
5. [Esquema do Banco de Dados](#5-esquema-do-banco-de-dados)
6. [Contratos da API](#6-contratos-da-api)
7. [Comunicação em Tempo Real (SSE)](#7-comunicação-em-tempo-real-sse)
8. [Integração com OpenClaw](#8-integração-com-openclaw)
9. [Variáveis de Ambiente](#9-variáveis-de-ambiente)
10. [Decisões de Arquitetura (ADRs)](#10-decisões-de-arquitetura-adrs)
11. [Changelog](#11-changelog)

---

## 1. Visão Geral da Arquitetura

### Stack

| Camada | Tecnologia | Versão mínima | Justificativa |
|---|---|---|---|
| Front-end | Next.js (App Router) | 14.x | SSR opcional, rotas de API collocadas, TypeScript nativo |
| Estilo | Tailwind CSS | 3.x | Sem abstração extra; agentes conseguem ler e escrever classes diretamente |
| Componentes UI | shadcn/ui (seletivo) | latest | Cópia local dos componentes — sem dependência de runtime externo |
| Estado global | Zustand | 4.x | API simples, sem boilerplate, fácil de testar |
| Cache / server state | TanStack Query (React Query) | 5.x | Invalidação automática, optimistic updates, retry |
| Back-end | Go + Chi | Go 1.22 / Chi 5.x | Binário único, performance nativa, deploy trivial; Chi é leve e idiomático |
| Banco de dados | SQLite via modernc.org/sqlite | latest | Pure Go, sem CGO, arquivo único, zero configuração |
| Migrações | golang-migrate + SQL puro | latest | Scripts versionados, legíveis por agentes |
| Agendamento | robfig/cron/v3 | 3.x | Cron jobs no processo do servidor, API simples |
| Comunicação real-time | Server-Sent Events (SSE) | net/http nativo | Unidirecional servidor→cliente; suporte nativo em Go sem biblioteca extra |
| Validação | go-playground/validator | 10.x | Validação de structs via tags, idiomático em Go |

### Princípios que guiam as escolhas

- **Legibilidade por agentes em primeiro lugar.** Código que um LLM vai ler e modificar precisa ser explícito. Prefira verbosidade a cleverness. Em Go isso significa structs bem nomeadas, sem magic e erros tratados explicitamente.
- **Zero serviços externos obrigatórios.** Tudo roda em `localhost`. Integrações externas (Telegram, Slack, Discord, API da Anthropic) são opcionais e configuradas via `.env`.
- **Falha silenciosa é proibida.** Toda operação que pode falhar deve registrar um entry no feed de atividade com `level: error`. Em Go: nunca ignorar o retorno de `error`.
- **Um único processo para o MVP.** Front-end e back-end no mesmo repositório. O Next.js serve o front-end na porta 3000; o binário Go serve a API na porta 3001. Um `start.sh` sobe tudo.

---

## 2. Diagrama de Componentes

```
┌─────────────────────────────────────────────────────────────────┐
│                        BROWSER (localhost:3000)                  │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐  │
│  │Dashboard │  │  Kanban  │  │ Agentes  │  │    Agenda      │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───────┬────────┘  │
│       │              │              │                 │            │
│  ┌────▼──────────────▼──────────────▼─────────────────▼────────┐ │
│  │              TanStack Query (cache + invalidação)            │ │
│  └──────────────────────────┬───────────────────────────────────┘ │
│                             │ HTTP / SSE                           │
└─────────────────────────────┼───────────────────────────────────┘
                              │
                   ┌──────────▼──────────┐
                   │   API SERVER         │
                   │   Go + Chi           │
                   │   localhost:3001     │
                   │                      │
                   │  ┌────────────────┐  │
                   │  │  Route Layer   │  │
                   │  │  /api/...      │  │
                   │  └───────┬────────┘  │
                   │          │            │
                   │  ┌───────▼────────┐  │
                   │  │ Service Layer  │  │
                   │  │ tasks, agents, │  │
                   │  │ events, crons  │  │
                   │  └───────┬────────┘  │
                   │          │            │
                   │  ┌───────▼────────┐  │
                   │  │  DB Layer      │  │
                   │  │  modernc sqlite│  │
                   │  └───────┬────────┘  │
                   │          │            │
                   │  ┌───────▼────────┐  │
                   │  │  mission.db    │  │
                   │  │  (SQLite file) │  │
                   │  └────────────────┘  │
                   │                      │
                   │  ┌────────────────┐  │
                   │  │  SSE Manager   │  │
                   │  │  /api/stream   │  │
                   │  └───────┬────────┘  │
                   │          │            │
                   │  ┌───────▼────────┐  │
                   │  │ robfig/cron v3 │  │
                   │  │  (scheduler)   │  │
                   │  └────────────────┘  │
                   └──────────┬───────────┘
                              │
              ┌───────────────┼───────────────┬───────────────┐
              │               │               │               │
    ┌─────────▼──┐   ┌────────▼───┐  ┌───────▼──────┐  ┌────▼───────────┐
    │ OpenClaw   │   │  Telegram  │  │  Slack       │  │  Discord       │
    │ Skills API │   │  Bot API   │  │  Webhook     │  │  Bot API       │
    │ (local)    │   │ (external) │  │  (external)  │  │  (external)    │
    └────────────┘   └────────────┘  └──────────────┘  └────────────────┘
```

### Responsabilidades por camada

**Route Layer:** Recebe requisições HTTP, valida o Bearer token, faz decode do payload e valida structs com `go-playground/validator`, delegando para o Service Layer. Não contém lógica de negócio.

**Service Layer:** Contém toda a lógica de negócio. Não sabe nada sobre HTTP — recebe objetos tipados e retorna objetos tipados. Chama o DB Layer e, quando necessário, o OpenClaw Skills API ou os webhooks externos.

**DB Layer:** Abstração sobre `database/sql` com driver `modernc.org/sqlite`. Expõe funções de query tipadas por entidade. Nenhuma query SQL fica fora desta camada.

**SSE Manager:** Singleton que mantém a lista de conexões SSE abertas e expõe um método `broadcast(event, data)` chamado pelo Service Layer sempre que algo muda.

---

## 3. Fluxos de Dados

### 3.1 Agente cria uma tarefa

```
PLEX (agente)
    │
    │  POST /api/tasks
    │  Authorization: Bearer <token>
    │  Body: { title, description, priority, agent_id, project_id }
    ▼
Route Layer
    │  Valida token
    │  Valida payload com struct tags + go-playground/validator
    ▼
TaskService.create(payload)
    │  Gera UUID
    │  Define created_at, updated_at
    │  Se due_date presente → cria evento no calendário
    ▼
DB Layer
    │  INSERT INTO tasks ...
    │  INSERT INTO events ... (se due_date)
    ▼
ActivityService.log({ agent_id: 'plex', type: 'task_created', message: ... })
    │
    ▼
SSEManager.broadcast('activity', { entry })
SSEManager.broadcast('tasks:update', { task })
    │
    ▼
Browser recebe evento SSE → TanStack Query invalida cache de tasks
    │
    ▼
Kanban re-renderiza com nova tarefa na coluna correta
```

### 3.2 Bruno move um card no Kanban

```
Bruno arrasta card para coluna "In Progress"
    │
    ▼
Optimistic update: Zustand atualiza estado local imediatamente
    │
    ▼
PATCH /api/tasks/:id  { status: "In Progress" }
    │
TaskService.update(id, { status })
    │
DB Layer: UPDATE tasks SET status = ?, updated_at = ? WHERE id = ?
    │
SSEManager.broadcast('tasks:update', { task })
    │
    ├─ Sucesso: TanStack Query confirma, estado local já estava correto
    └─ Falha:   Zustand reverte estado local, toast de erro exibido
```

### 3.3 Cron job dispara

```
robfig/cron v3 (a cada tick)
    │  Verifica crons ativos cuja next_run_at <= now()
    ▼
CronService.execute(cron)
    │  Chama OpenClaw Skills API com o comando configurado
    │  Atualiza last_run_at e next_run_at no banco
    ▼
ActivityService.log({ type: 'cron_ran', ... })
    │
    ▼
SSEManager.broadcast('activity', { entry })
```

### 3.4 Dashboard carrega

```
Browser abre /
    │
    ▼
GET /api/dashboard/summary
    │  Retorna: { tasks_total, tasks_in_progress, tasks_done_week,
    │             tasks_overdue, cost_week_usd, sessions_active,
    │             activity_feed (últimas 20), next_crons (próximos 5) }
    ▼
Browser estabelece SSE em GET /api/stream
    │  Recebe eventos: 'activity', 'tasks:update', 'sessions:update'
    ▼
Dashboard atualiza indicadores em tempo real sem reload
```

---

## 4. Estrutura de Pastas

```
mission-control/
│
├── .env                          # Variáveis de ambiente (não commitar)
├── .env.example                  # Template com todas as variáveis necessárias
├── start.sh                      # Sobe back-end Go + front-end Next.js
│
├── apps/
│   ├── web/                      # Front-end Next.js (npm)
│   │   ├── package.json
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   ├── tsconfig.json
│   │   │
│   │   ├── app/                  # App Router
│   │   │   ├── layout.tsx        # Layout raiz (sidebar, providers)
│   │   │   ├── page.tsx          # Redireciona para /dashboard
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx
│   │   │   ├── tasks/
│   │   │   │   └── page.tsx
│   │   │   ├── agents/
│   │   │   │   └── page.tsx
│   │   │   ├── schedule/
│   │   │   │   └── page.tsx
│   │   │   ├── observability/
│   │   │   │   └── page.tsx
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── ui/               # shadcn/ui (cópias locais, não modificar)
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   └── TopBar.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── SummaryCards.tsx
│   │   │   │   ├── ActivityFeed.tsx
│   │   │   │   └── NextCrons.tsx
│   │   │   ├── tasks/
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   ├── KanbanColumn.tsx
│   │   │   │   ├── TaskCard.tsx
│   │   │   │   └── TaskModal.tsx
│   │   │   ├── agents/
│   │   │   │   ├── AgentGrid.tsx
│   │   │   │   ├── AgentCard.tsx
│   │   │   │   └── AgentModal.tsx
│   │   │   ├── schedule/
│   │   │   │   ├── CalendarWeek.tsx
│   │   │   │   ├── CalendarMonth.tsx
│   │   │   │   ├── CronList.tsx
│   │   │   │   └── EventModal.tsx
│   │   │   └── observability/
│   │   │       ├── SessionTable.tsx
│   │   │       ├── TokenChart.tsx
│   │   │       └── LogList.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useSSE.ts         # Hook para conexão SSE com auto-reconnect
│   │   │   ├── useTasks.ts
│   │   │   ├── useAgents.ts
│   │   │   └── useDashboard.ts
│   │   │
│   │   ├── lib/
│   │   │   ├── api-client.ts     # Wrapper do fetch com base URL e auth header
│   │   │   ├── query-client.ts   # Configuração do TanStack Query
│   │   │   └── utils.ts          # cn(), formatDate(), formatCost()
│   │   │
│   │   └── store/
│   │       ├── ui.store.ts       # Estado de UI: modal aberto, filtros ativos
│   │       └── demo.store.ts     # Estado do modo demo
│   │
│   └── api/                      # Back-end Go
│       ├── go.mod                # module github.com/bruno/mission-control/api
│       ├── go.sum
│       ├── main.go               # Entry point: inicializa config, DB, router, scheduler
│       ├── Makefile              # make dev, make build, make migrate
│       │
│       ├── config/
│       │   └── config.go         # Lê .env com godotenv, valida e exporta struct Config
│       │
│       ├── db/
│       │   ├── db.go             # Abre conexão SQLite (modernc), habilita WAL
│       │   ├── migrate.go        # Lê e executa migrations/*.sql em ordem
│       │   └── queries/          # Funções de query tipadas, uma por entidade
│       │       ├── tasks.go
│       │       ├── agents.go
│       │       ├── events.go
│       │       ├── crons.go
│       │       ├── sessions.go
│       │       └── activity.go
│       │
│       ├── domain/               # Structs de domínio sem dependência de HTTP ou DB
│       │   ├── task.go
│       │   ├── agent.go
│       │   ├── event.go
│       │   ├── cron.go
│       │   ├── session.go
│       │   └── activity.go
│       │
│       ├── service/              # Lógica de negócio; recebe/retorna tipos de domain/
│       │   ├── task_service.go
│       │   ├── agent_service.go
│       │   ├── event_service.go
│       │   ├── cron_service.go
│       │   ├── session_service.go
│       │   ├── activity_service.go
│       │   └── dashboard_service.go
│       │
│       ├── handler/              # Handlers Chi: decode → service → encode JSON
│       │   ├── tasks.go
│       │   ├── agents.go
│       │   ├── events.go
│       │   ├── crons.go
│       │   ├── sessions.go
│       │   ├── activity.go
│       │   ├── dashboard.go
│       │   ├── stream.go         # SSE handler
│       │   └── health.go
│       │
│       ├── middleware/
│       │   ├── auth.go           # Valida Bearer token
│       │   └── cors.go           # CORS para localhost:3000
│       │
│       ├── sse/
│       │   └── broker.go         # Singleton: Register, Unregister, Broadcast
│       │
│       ├── scheduler/
│       │   └── scheduler.go      # robfig/cron: carrega e executa jobs do banco
│       │
│       ├── integration/
│       │   ├── openclaw.go
│       │   ├── telegram.go
│       │   ├── slack.go
│       │   └── discord.go
│       │
│       ├── data/                 # Criado em runtime — adicionar ao .gitignore
│       │   └── mission.db
│       │
│       └── migrations/
│           ├── 001_initial_schema.sql
│           ├── 002_add_projects.sql
│           └── ...
│
└── docs/
    ├── PRD-v2.md                 # Produto
    ├── ARCHITECTURE.md           # Este documento
    └── AGENTS.md                 # Guia de onboarding para agentes
```

### Regras de organização de código (para agentes)

**Back-end Go:**
- **Máximo 200 linhas por arquivo.** Se ultrapassar, extraia funções ou tipos.
- **Nunca ignorar `error`.** Todo `err != nil` deve ser tratado — retornado, logado ou registrado no feed de atividade.
- **Nenhuma lógica de negócio em `handler/`.** Handlers fazem decode → service → encode. Nada mais.
- **Nenhuma query SQL fora de `db/queries/`.** Se precisar de uma query nova, adicione nessa pasta.
- **Tipos de domínio em `domain/`.** Structs que transitam entre camadas vivem em `domain/`, nunca definidas inline em handlers ou services.
- **Erros wrappados com contexto:** `fmt.Errorf("task service: create: %w", err)`.

**Front-end Next.js:**
- **Máximo 200 linhas por arquivo.** Se ultrapassar, extraia componentes ou hooks.
- **Um componente por arquivo.** Nunca exportar dois componentes React do mesmo arquivo.
- **Imports absolutos.** Usar `@/components/...`, `@/hooks/...` etc. Nunca `../../..`.
- **Nenhuma lógica de negócio em componentes React.** Lógica vai em hooks.

---

## 5. Esquema do Banco de Dados

O banco de dados é um arquivo SQLite em `apps/api/data/mission.db`. O diretório `data/` é criado automaticamente na primeira execução.

### 5.1 Tabelas

```sql
-- ============================================================
-- AGENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS agents (
  id          TEXT PRIMARY KEY,           -- minúsculas: 'tars', 'case', 'kipp', 'plex', 'echo'
  name        TEXT NOT NULL,              -- ex: 'TARS'
  role        TEXT NOT NULL,              -- ex: 'Chief of Staff'
  description TEXT,
  input_signal  TEXT,                     -- o que o agente espera receber
  output_action TEXT,                     -- o que o agente produz
  status      TEXT NOT NULL DEFAULT 'offline', -- 'online' | 'offline' | 'running'
  soul_md     TEXT,                       -- prompt inicial / SOUL.md do agente
  last_seen_at TEXT,                      -- ISO 8601 datetime
  archived_at TEXT,                       -- NULL = ativo; preenchido = arquivado
  created_at  TEXT NOT NULL
);

-- ============================================================
-- PROJECTS
-- ============================================================
CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active', -- 'active' | 'paused' | 'done'
  description TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

-- ============================================================
-- TASKS
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,           -- UUID v4
  title       TEXT NOT NULL,
  description TEXT,                       -- Markdown
  status      TEXT NOT NULL,              -- nome da coluna do Kanban
  priority    TEXT NOT NULL DEFAULT 'medium', -- 'high' | 'medium' | 'low'
  due_date    TEXT,                       -- ISO 8601 date (YYYY-MM-DD)
  tags        TEXT,                       -- JSON array de strings: '["design","bug"]'
  agent_id    TEXT REFERENCES agents(id),
  project_id  TEXT REFERENCES projects(id),
  created_by  TEXT NOT NULL,              -- 'user' ou agent_id
  created_at  TEXT NOT NULL,              -- ISO 8601 datetime
  updated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_agent_id   ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date   ON tasks(due_date);

-- ============================================================
-- KANBAN_COLUMNS
-- Permite ao usuário configurar as colunas do Kanban
-- ============================================================
CREATE TABLE IF NOT EXISTS kanban_columns (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  position    INTEGER NOT NULL,           -- ordem de exibição (0-indexed)
  color       TEXT,                       -- hex color opcional
  created_at  TEXT NOT NULL
);

-- Dados iniciais inseridos na migration
-- INSERT INTO kanban_columns VALUES ('col_backlog', 'Backlog', 0, NULL, ...)
-- INSERT INTO kanban_columns VALUES ('col_inprogress', 'In Progress', 1, NULL, ...)
-- INSERT INTO kanban_columns VALUES ('col_review', 'Review', 2, NULL, ...)
-- INSERT INTO kanban_columns VALUES ('col_done', 'Done', 3, NULL, ...)

-- ============================================================
-- EVENTS (Calendário)
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
  id           TEXT PRIMARY KEY,
  title        TEXT NOT NULL,
  start_at     TEXT NOT NULL,             -- ISO 8601 datetime
  end_at       TEXT,                      -- ISO 8601 datetime (opcional)
  type         TEXT NOT NULL,             -- 'manual' | 'task' | 'cron'
  task_id      TEXT REFERENCES tasks(id) ON DELETE CASCADE,
  cron_id      TEXT REFERENCES crons(id) ON DELETE CASCADE,
  recurrence   TEXT,                      -- NULL | 'daily' | 'weekly' | 'monthly'
  notes        TEXT,
  created_at   TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_events_type     ON events(type);

-- ============================================================
-- CRONS
-- ============================================================
CREATE TABLE IF NOT EXISTS crons (
  id           TEXT PRIMARY KEY,
  name         TEXT NOT NULL,
  expression   TEXT NOT NULL,             -- cron expression: '0 9 * * 1-5'
  agent_id     TEXT REFERENCES agents(id),
  command      TEXT NOT NULL,             -- comando enviado ao agente
  active       INTEGER NOT NULL DEFAULT 1, -- 0 = pausado, 1 = ativo
  last_run_at  TEXT,                      -- ISO 8601 datetime
  next_run_at  TEXT,                      -- calculado pelo scheduler
  created_at   TEXT NOT NULL,
  updated_at   TEXT NOT NULL
);

-- ============================================================
-- SESSIONS (Consumo de tokens)
-- ============================================================
CREATE TABLE IF NOT EXISTS sessions (
  id             TEXT PRIMARY KEY,
  agent_id       TEXT REFERENCES agents(id),
  model          TEXT NOT NULL,           -- 'claude-opus-4-6' | 'claude-sonnet-4-6' | etc.
  input_tokens   INTEGER NOT NULL DEFAULT 0,
  output_tokens  INTEGER NOT NULL DEFAULT 0,
  cost_usd       REAL NOT NULL DEFAULT 0,
  started_at     TEXT NOT NULL,
  ended_at       TEXT                     -- NULL = sessão ainda ativa
);

CREATE INDEX IF NOT EXISTS idx_sessions_agent_id  ON sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_sessions_started_at ON sessions(started_at);

-- ============================================================
-- ACTIVITY (Feed de atividade + logs)
-- ============================================================
CREATE TABLE IF NOT EXISTS activity (
  id         TEXT PRIMARY KEY,
  agent_id   TEXT REFERENCES agents(id),
  type       TEXT NOT NULL,
  -- tipos válidos:
  -- 'task_created' | 'task_updated' | 'task_done'
  -- 'message_sent' | 'command_sent' | 'command_received'
  -- 'cron_ran'
  -- 'session_started' | 'session_ended'
  -- 'error'
  message    TEXT NOT NULL,               -- texto legível por humano
  metadata   TEXT,                        -- JSON com detalhes extras (task_id, error_stack, etc.)
  level      TEXT NOT NULL DEFAULT 'info', -- 'info' | 'warn' | 'error'
  read_at    TEXT,                        -- NULL = não lido (para badge de erros)
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_agent_id  ON activity(agent_id);
CREATE INDEX IF NOT EXISTS idx_activity_level     ON activity(level);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity(created_at);

-- ============================================================
-- SETTINGS
-- Tabela de chave-valor para configurações da aplicação
-- ============================================================
CREATE TABLE IF NOT EXISTS settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL,               -- sempre JSON (string, number, boolean, object)
  updated_at TEXT NOT NULL
);

-- Valores padrão inseridos na migration inicial:
-- weekly_cost_limit_usd: "20"
-- demo_mode: "false"
-- log_retention_days: "30"
-- timezone: "America/Sao_Paulo"
```

### 5.2 Convenções do banco

- **Todos os timestamps em ISO 8601 UTC:** `2026-02-24T15:30:00.000Z`. Converter para o timezone do usuário apenas na camada de apresentação.
- **IDs sempre UUID v4** gerados no back-end Go (ex.: `github.com/google/uuid`). Nunca usar autoincrement.
- **Deleção lógica não existe no MVP.** Usar `archived_at` para agentes. Tarefas, eventos e crons são deletados fisicamente (`DELETE`).
- **JSON armazenado como TEXT.** Serializar com `encoding/json` (`json.Marshal`) antes de inserir; deserializar com `json.Unmarshal` ao ler. O DB Layer encapsula isso.
- **WAL mode habilitado** no início da conexão: `PRAGMA journal_mode=WAL;` — evita travamentos em reads concorrentes.

---

## 6. Contratos da API

**Base URL:** `http://localhost:3001`  
**Autenticação:** Todas as rotas (exceto `/health`) exigem `Authorization: Bearer <API_TOKEN>`.  
**Content-Type:** `application/json` em todas as requisições e respostas.  
**Timestamps:** sempre UTC ISO 8601 em strings.

---

### 6.1 Health

#### `GET /health`
Verifica se o servidor está no ar. Não requer autenticação.

**Response 200:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "uptime_seconds": 3600
}
```

---

### 6.2 Dashboard

#### `GET /api/dashboard/summary`
Retorna todos os dados necessários para renderizar o dashboard inicial.

**Response 200:**
```json
{
  "tasks": {
    "total": 24,
    "in_progress": 5,
    "done_this_week": 8,
    "overdue": 2
  },
  "cost": {
    "week_usd": 4.32,
    "week_limit_usd": 20.00,
    "week_percent": 21.6
  },
  "sessions": {
    "active_count": 2
  },
  "activity_feed": [
    {
      "id": "uuid",
      "agent_id": "plex",
      "agent_name": "PLEX",
      "type": "task_created",
      "message": "Criou a tarefa 'Implementar autenticação JWT'",
      "level": "info",
      "created_at": "2026-02-24T15:30:00.000Z"
    }
  ],
  "next_crons": [
    {
      "id": "uuid",
      "name": "Daily Standup Summary",
      "agent_id": "tars",
      "agent_name": "TARS",
      "next_run_at": "2026-02-25T09:00:00.000Z"
    }
  ]
}
```

---

### 6.3 Tasks

#### `GET /api/tasks`
Lista tarefas com filtros opcionais.

**Query params:**
| Param | Tipo | Descrição |
|---|---|---|
| `status` | string | Filtra pelo nome da coluna (ex.: `In Progress`) |
| `agent_id` | string | Filtra por agente responsável |
| `project_id` | string | Filtra por projeto |
| `priority` | `high` \| `medium` \| `low` | Filtra por prioridade |
| `due_before` | ISO 8601 date | Tarefas com vencimento até esta data |
| `due_after` | ISO 8601 date | Tarefas com vencimento a partir desta data |
| `search` | string | Busca por texto em `title` e `description` |

**Response 200:**
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "title": "Implementar autenticação JWT",
      "description": "## O que fazer\n...",
      "status": "In Progress",
      "priority": "high",
      "due_date": "2026-02-28",
      "tags": ["backend", "security"],
      "agent_id": "plex",
      "agent_name": "PLEX",
      "project_id": "proj_meu_foco",
      "project_name": "Meu Foco",
      "created_by": "user",
      "created_at": "2026-02-24T10:00:00.000Z",
      "updated_at": "2026-02-24T15:00:00.000Z"
    }
  ],
  "total": 1
}
```

---

#### `POST /api/tasks`
Cria uma nova tarefa. Pode ser chamado pelo usuário ou por um agente.

**Request body:**
```json
{
  "title": "Implementar autenticação JWT",        // obrigatório
  "description": "## O que fazer\n...",           // opcional, Markdown
  "status": "Backlog",                            // opcional, padrão: primeira coluna
  "priority": "high",                             // opcional, padrão: "medium"
  "due_date": "2026-02-28",                       // opcional, YYYY-MM-DD
  "tags": ["backend", "security"],                // opcional
  "agent_id": "plex",                             // opcional
  "project_id": "proj_meu_foco",                  // opcional
  "created_by": "plex"                            // opcional, padrão: "user"
}
```

**Response 201:**
```json
{
  "task": { /* objeto completo da tarefa */ }
}
```

**Erros:**
- `400` — payload inválido (campo obrigatório ausente ou tipo errado)
- `422` — `status` não corresponde a nenhuma coluna existente
- `422` — `agent_id` não existe no banco

---

#### `PATCH /api/tasks/:id`
Atualiza campos de uma tarefa existente. Somente os campos enviados são alterados.

**Request body:** qualquer subconjunto dos campos de `POST /api/tasks` (exceto `created_by`).

**Response 200:**
```json
{
  "task": { /* objeto completo atualizado */ }
}
```

**Erros:**
- `404` — tarefa não encontrada

---

#### `DELETE /api/tasks/:id`
Remove a tarefa e o evento de calendário associado (se existir).

**Response 204:** sem body.

---

### 6.4 Agents

#### `GET /api/agents`
Lista todos os agentes não arquivados.

**Response 200:**
```json
{
  "agents": [
    {
      "id": "tars",
      "name": "TARS",
      "role": "Chief of Staff",
      "description": "...",
      "input_signal": "...",
      "output_action": "...",
      "status": "online",
      "last_seen_at": "2026-02-24T15:00:00.000Z",
      "active_tasks_count": 3
    }
  ]
}
```

---

#### `POST /api/agents`
Cadastra um novo agente.

**Request body:**
```json
{
  "id": "echo",                    // obrigatório, minúsculas, sem espaço
  "name": "ECHO",                  // obrigatório
  "role": "Social Media Manager",  // obrigatório
  "description": "...",            // opcional
  "input_signal": "...",           // opcional
  "output_action": "...",          // opcional
  "soul_md": "You are ECHO..."     // opcional
}
```

**Response 201:**
```json
{
  "agent": { /* objeto completo */ }
}
```

---

#### `PATCH /api/agents/:id`
Atualiza campos de um agente. Também usado para atualizar `status` e `last_seen_at` (feito pelo próprio agente via heartbeat).

**Request body:** qualquer subconjunto dos campos cadastráveis.

**Response 200:**
```json
{
  "agent": { /* objeto atualizado */ }
}
```

---

#### `POST /api/agents/:id/command`
Envia um comando de texto para um agente via OpenClaw Skills API.

**Request body:**
```json
{
  "command": "Crie um roteiro para o próximo vídeo do canal sobre automação com IA"
}
```

**Response 202:** (aceito, execução assíncrona)
```json
{
  "activity_id": "uuid"
}
```

---

### 6.5 Events (Calendário)

#### `GET /api/events`
Lista eventos num intervalo de datas.

**Query params:**
| Param | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `start` | ISO 8601 date | Sim | Início do intervalo |
| `end` | ISO 8601 date | Sim | Fim do intervalo |
| `type` | `manual` \| `task` \| `cron` | Não | Filtra por tipo |

**Response 200:**
```json
{
  "events": [
    {
      "id": "uuid",
      "title": "Review PR Meu Flip",
      "start_at": "2026-02-25T14:00:00.000Z",
      "end_at": "2026-02-25T15:00:00.000Z",
      "type": "task",
      "task_id": "uuid-da-task",
      "cron_id": null,
      "recurrence": null,
      "notes": null,
      "created_at": "2026-02-24T10:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/events`
Cria um evento manual.

**Request body:**
```json
{
  "title": "Call com investidor",              // obrigatório
  "start_at": "2026-02-25T14:00:00.000Z",     // obrigatório
  "end_at": "2026-02-25T15:00:00.000Z",       // opcional
  "recurrence": "weekly",                     // opcional
  "notes": "Preparar deck antes"              // opcional
}
```

**Response 201:**
```json
{
  "event": { /* objeto completo */ }
}
```

---

#### `PATCH /api/events/:id`
Atualiza um evento (incluindo mover via drag no calendário).

**Response 200:**
```json
{
  "event": { /* objeto atualizado */ }
}
```

---

#### `DELETE /api/events/:id`
Remove um evento manual. Eventos do tipo `task` e `cron` não podem ser deletados diretamente — devem ser gerenciados via `/api/tasks` e `/api/crons`.

**Response 204:** sem body.  
**Erro 422:** se tentar deletar evento de tipo `task` ou `cron`.

---

### 6.6 Crons

#### `GET /api/crons`
Lista todos os cron jobs.

**Response 200:**
```json
{
  "crons": [
    {
      "id": "uuid",
      "name": "Daily Standup Summary",
      "expression": "0 9 * * 1-5",
      "agent_id": "tars",
      "agent_name": "TARS",
      "command": "Gere o resumo do standup de hoje",
      "active": true,
      "last_run_at": "2026-02-24T09:00:00.000Z",
      "next_run_at": "2026-02-25T09:00:00.000Z",
      "created_at": "2026-02-01T00:00:00.000Z"
    }
  ]
}
```

---

#### `POST /api/crons`
Cria um novo cron job.

**Request body:**
```json
{
  "name": "Daily Standup Summary",        // obrigatório
  "expression": "0 9 * * 1-5",           // obrigatório, cron expression válida
  "agent_id": "tars",                     // obrigatório
  "command": "Gere o resumo do standup",  // obrigatório
  "active": true                          // opcional, padrão: true
}
```

**Response 201:**
```json
{
  "cron": { /* objeto completo */ }
}
```

**Erro 422:** se `expression` for uma cron expression inválida.

---

#### `PATCH /api/crons/:id`
Atualiza ou pausa/retoma um cron.

**Request body:** qualquer campo, incluindo `{ "active": false }` para pausar.

**Response 200:**
```json
{
  "cron": { /* objeto atualizado */ }
}
```

---

#### `DELETE /api/crons/:id`
Remove o cron e os eventos de calendário futuros associados.

**Response 204:** sem body.

---

### 6.7 Sessions

#### `GET /api/sessions`
Lista sessões. Sem filtro retorna apenas sessões ativas (`ended_at IS NULL`).

**Query params:**
| Param | Tipo | Descrição |
|---|---|---|
| `include_ended` | `true` | Inclui sessões encerradas |
| `agent_id` | string | Filtra por agente |
| `since` | ISO 8601 datetime | Sessões iniciadas a partir desta data |

**Response 200:**
```json
{
  "sessions": [
    {
      "id": "uuid",
      "agent_id": "case",
      "agent_name": "CASE",
      "model": "claude-sonnet-4-6",
      "input_tokens": 12400,
      "output_tokens": 3200,
      "cost_usd": 0.042,
      "started_at": "2026-02-24T14:00:00.000Z",
      "ended_at": null,
      "duration_minutes": 32
    }
  ],
  "total_cost_usd": 0.042
}
```

---

#### `POST /api/sessions`
Registra uma nova sessão. Chamado pelo agente ao iniciar uma sessão.

**Request body:**
```json
{
  "id": "uuid-gerado-pelo-agente",   // obrigatório
  "agent_id": "case",                // obrigatório
  "model": "claude-sonnet-4-6"       // obrigatório
}
```

**Response 201:**
```json
{
  "session": { /* objeto completo */ }
}
```

---

#### `PATCH /api/sessions/:id`
Atualiza tokens consumidos ou encerra a sessão.

**Request body:**
```json
{
  "input_tokens": 15000,
  "output_tokens": 4000,
  "cost_usd": 0.055,
  "ended_at": "2026-02-24T15:00:00.000Z"   // preencher para encerrar
}
```

**Response 200:**
```json
{
  "session": { /* objeto atualizado */ }
}
```

---

### 6.8 Activity

#### `GET /api/activity`
Lista entradas do feed de atividade.

**Query params:**
| Param | Tipo | Descrição |
|---|---|---|
| `agent_id` | string | Filtra por agente |
| `level` | `info` \| `warn` \| `error` | Filtra por nível |
| `type` | string | Filtra por tipo de ação |
| `since` | ISO 8601 datetime | Entradas a partir desta data |
| `limit` | integer | Máximo de resultados (padrão: 50, máx: 200) |

**Response 200:**
```json
{
  "entries": [
    {
      "id": "uuid",
      "agent_id": "plex",
      "agent_name": "PLEX",
      "type": "task_created",
      "message": "Criou a tarefa 'Implementar autenticação JWT'",
      "metadata": { "task_id": "uuid-da-task" },
      "level": "info",
      "read_at": null,
      "created_at": "2026-02-24T15:30:00.000Z"
    }
  ],
  "unread_errors": 3
}
```

---

#### `POST /api/activity`
Registra uma nova entrada. Chamado pelos agentes para reportar ações.

**Request body:**
```json
{
  "agent_id": "plex",                        // obrigatório
  "type": "task_created",                    // obrigatório
  "message": "Criou a tarefa '...'",         // obrigatório
  "metadata": { "task_id": "uuid" },         // opcional
  "level": "info"                            // opcional, padrão: "info"
}
```

**Response 201:**
```json
{
  "entry": { /* objeto completo */ }
}
```

---

#### `PATCH /api/activity/mark-read`
Marca entradas como lidas (para zerar o badge de erros).

**Request body:**
```json
{
  "ids": ["uuid1", "uuid2"],    // opcional: IDs específicos
  "level": "error"              // opcional: marca todos do nível
}
```

**Response 200:**
```json
{
  "marked": 3
}
```

---

### 6.9 Settings

#### `GET /api/settings`
Retorna todas as configurações.

**Response 200:**
```json
{
  "settings": {
    "weekly_cost_limit_usd": 20,
    "demo_mode": false,
    "log_retention_days": 30,
    "timezone": "America/Sao_Paulo"
  }
}
```

---

#### `PATCH /api/settings`
Atualiza uma ou mais configurações.

**Request body:**
```json
{
  "weekly_cost_limit_usd": 30,
  "demo_mode": true
}
```

**Response 200:**
```json
{
  "settings": { /* objeto completo atualizado */ }
}
```

---

## 7. Comunicação em Tempo Real (SSE)

### `GET /api/stream`
Estabelece uma conexão Server-Sent Events. O cliente deve reconectar automaticamente em caso de queda.

**Headers de resposta:**
```
Content-Type: text/event-stream
Cache-Control: no-cache
Connection: keep-alive
```

### Formato dos eventos

Cada evento SSE segue o formato:
```
event: <nome-do-evento>
data: <JSON serializado>

```

### Eventos emitidos pelo servidor

| Evento | Quando disparado | Payload |
|---|---|---|
| `connected` | Ao estabelecer conexão | `{ "message": "connected" }` |
| `activity` | Nova entrada no feed | Objeto `ActivityEntry` completo |
| `tasks:update` | Tarefa criada ou modificada | Objeto `Task` completo |
| `tasks:delete` | Tarefa deletada | `{ "id": "uuid" }` |
| `sessions:update` | Sessão criada, atualizada ou encerrada | Objeto `Session` completo |
| `agents:update` | Status de agente alterado | Objeto `Agent` completo |
| `ping` | A cada 30s para manter conexão | `{ "ts": "ISO datetime" }` |

### SSE Broker — Go (back-end)

```go
// apps/api/sse/broker.go
package sse

import (
	"fmt"
	"net/http"
	"sync"
)

type Broker struct {
	mu      sync.RWMutex
	clients map[chan string]struct{}
}

var Default = &Broker{
	clients: make(map[chan string]struct{}),
}

// Register adiciona um cliente SSE. Retorna o canal de mensagens.
func (b *Broker) Register() chan string {
	ch := make(chan string, 16)
	b.mu.Lock()
	b.clients[ch] = struct{}{}
	b.mu.Unlock()
	return ch
}

// Unregister remove o cliente e fecha o canal.
func (b *Broker) Unregister(ch chan string) {
	b.mu.Lock()
	delete(b.clients, ch)
	b.mu.Unlock()
	close(ch)
}

// Broadcast envia um evento SSE para todos os clientes conectados.
// Formato: "event: <name>\ndata: <json>\n\n"
func (b *Broker) Broadcast(event string, json string) {
	msg := fmt.Sprintf("event: %s\ndata: %s\n\n", event, json)
	b.mu.RLock()
	for ch := range b.clients {
		select {
		case ch <- msg:
		default: // cliente lento: descarta o evento, não bloqueia
		}
	}
	b.mu.RUnlock()
}
```

```go
// apps/api/handler/stream.go
package handler

import (
	"net/http"
	"time"
	"github.com/bruno/mission-control/api/sse"
)

func StreamHandler(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no") // desabilita buffer no Nginx

	flusher, ok := w.(http.Flusher)
	if !ok {
		http.Error(w, "SSE not supported", http.StatusInternalServerError)
		return
	}

	ch := sse.Default.Register()
	defer sse.Default.Unregister(ch)

	// Evento inicial de confirmação
	fmt.Fprintf(w, "event: connected\ndata: {\"message\":\"connected\"}\n\n")
	flusher.Flush()

	// Ping a cada 30s para manter conexão viva
	ticker := time.NewTicker(30 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case msg, ok := <-ch:
			if !ok {
				return
			}
			fmt.Fprint(w, msg)
			flusher.Flush()
		case <-ticker.C:
			fmt.Fprintf(w, "event: ping\ndata: {\"ts\":\"%s\"}\n\n", time.Now().UTC().Format(time.RFC3339))
			flusher.Flush()
		case <-r.Context().Done():
			return
		}
	}
}
```

### Hook useSSE (front-end TypeScript)

```typescript
// apps/web/hooks/useSSE.ts
export function useSSE(onEvent: (event: string, data: unknown) => void) {
  useEffect(() => {
    let es: EventSource;
    let retryTimeout: ReturnType<typeof setTimeout>;

    function connect() {
      es = new EventSource(`${API_BASE_URL}/api/stream`, {
        // withCredentials se usar cookies
      });

      es.addEventListener('activity', (e) => onEvent('activity', JSON.parse(e.data)));
      es.addEventListener('tasks:update', (e) => onEvent('tasks:update', JSON.parse(e.data)));
      // ... outros eventos

      es.onerror = () => {
        es.close();
        retryTimeout = setTimeout(connect, 5000); // reconecta em 5s
      };
    }

    connect();
    return () => { es?.close(); clearTimeout(retryTimeout); };
  }, []);
}
```

---

## 8. Integração com OpenClaw

### 8.1 Skills que os agentes chamam no Mission Control

Os agentes chamam a API do Mission Control diretamente via HTTP com o Bearer token armazenado em sua configuração de ambiente. Não há camada intermediária.

**Endpoints mais usados pelos agentes:**

```
POST /api/tasks              → criar tarefa
PATCH /api/tasks/:id         → atualizar status/progresso
POST /api/activity           → registrar ação no feed
PATCH /api/agents/:id        → atualizar status e last_seen_at (heartbeat)
POST /api/sessions           → registrar nova sessão
PATCH /api/sessions/:id      → atualizar tokens / encerrar sessão
GET /api/dashboard/summary   → obter contexto atual antes de executar tarefa
```

### 8.2 Heartbeat dos agentes

Cada agente deve enviar um heartbeat a cada 60 segundos enquanto estiver ativo:

```
PATCH /api/agents/tars
Body: { "status": "running", "last_seen_at": "<ISO datetime>" }
```

O servidor marca o agente como `offline` automaticamente se não receber heartbeat por mais de 3 minutos (via job interno a cada minuto).

### 8.3 Skills que o Mission Control chama no OpenClaw

```go
// apps/api/integration/openclaw.go
package integration

import (
	"bytes"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
)

// SendCommand envia um comando de texto para um agente via OpenClaw Skills API.
func SendCommand(agentID, command string) error {
	baseURL := os.Getenv("OPENCLAW_API_URL")
	if baseURL == "" {
		return nil // modo standalone: ignora silenciosamente
	}

	body, _ := json.Marshal(map[string]string{
		"agent_id": agentID,
		"message":  command,
	})

	req, err := http.NewRequest("POST", baseURL+"/skills/sessions_send", bytes.NewReader(body))
	if err != nil {
		return fmt.Errorf("openclaw: send command: %w", err)
	}
	req.Header.Set("Authorization", "Bearer "+os.Getenv("OPENCLAW_API_TOKEN"))
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return fmt.Errorf("openclaw: send command: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("openclaw: send command: status %d", resp.StatusCode)
	}
	return nil
}
```

### 8.4 Variáveis necessárias para a integração

```env
OPENCLAW_API_URL=http://localhost:4000
OPENCLAW_API_TOKEN=<token-do-openclaw>
```

Se `OPENCLAW_API_URL` não estiver definida, o Mission Control opera em modo standalone: agentes não recebem comandos via interface, mas toda a gestão de tarefas, feed e banco funciona normalmente.

---

## 9. Variáveis de Ambiente

Arquivo `.env` na raiz do projeto. Copiar de `.env.example` ao configurar.

```env
# ─── Servidor ──────────────────────────────────────────────────────
NODE_ENV=development                  # 'development' | 'production'
API_PORT=3001                         # Porta do back-end Go (Chi)
WEB_PORT=3000                         # Porta do front-end Next.js

# ─── Autenticação ──────────────────────────────────────────────────
API_TOKEN=<gerar-com-openssl-rand-hex-32>
# Gerado automaticamente na primeira execução se não existir

# ─── Banco de dados ────────────────────────────────────────────────
DB_PATH=./data/mission.db             # Relativo a apps/api/

# ─── OpenClaw (opcional) ───────────────────────────────────────────
OPENCLAW_API_URL=http://localhost:4000
OPENCLAW_API_TOKEN=

# ─── Telegram (opcional) ───────────────────────────────────────────
TELEGRAM_BOT_TOKEN=
TELEGRAM_CHAT_ID=

# ─── Slack (opcional) ──────────────────────────────────────────────
SLACK_WEBHOOK_URL=

# ─── Discord (opcional) ────────────────────────────────────────────
DISCORD_BOT_TOKEN=
DISCORD_CHANNEL_ID=

# ─── Preços de modelos (USD por 1M tokens) ─────────────────────────
# Usado para calcular custo das sessões
MODEL_PRICE_claude-opus-4-6_INPUT=15.00
MODEL_PRICE_claude-opus-4-6_OUTPUT=75.00
MODEL_PRICE_claude-sonnet-4-6_INPUT=3.00
MODEL_PRICE_claude-sonnet-4-6_OUTPUT=15.00
MODEL_PRICE_claude-haiku-4-5_INPUT=0.80
MODEL_PRICE_claude-haiku-4-5_OUTPUT=4.00

# ─── Configurações padrão ──────────────────────────────────────────
WEEKLY_COST_LIMIT_USD=20
LOG_RETENTION_DAYS=30
TIMEZONE=America/Sao_Paulo
```

---

## 10. Decisões de Arquitetura (ADRs)

### ADR-001: SQLite em vez de Postgres
**Decisão:** Usar SQLite como banco de dados principal para o MVP.  
**Motivo:** Zero configuração, arquivo único fácil de fazer backup, sem processo separado para gerenciar. A carga esperada (um usuário, alguns agentes) não justifica a complexidade do Postgres.  
**Consequência:** Writes são serializados; se concorrência se tornar um problema em fases futuras, migrar para Postgres com a mesma interface de queries.

### ADR-002: Go + Chi em vez de Node.js + Fastify
**Decisão:** Usar Go com o roteador Chi para o back-end.  
**Motivo:** Binário único sem runtime externo simplifica o deploy (basta copiar o executável). Performance nativa com goroutines é ideal para SSE com múltiplos clientes. Tipagem estática forte reduz bugs em tempo de execução. Chi é minimalista e idiomático — handlers são `http.HandlerFunc` padrão da stdlib, sem magic de framework.  
**Consequência:** Os agentes precisam escrever Go em vez de TypeScript para modificar o back-end. O pacote `packages/shared` de tipos TypeScript deixa de existir — os contratos da API são mantidos neste documento e nos structs em `domain/`.

### ADR-003: SSE em vez de WebSocket
**Decisão:** Usar Server-Sent Events para comunicação em tempo real.  
**Motivo:** O fluxo é unidirecional (servidor → cliente). SSE é mais simples de implementar, não requer upgrade de protocolo, funciona bem atrás de proxies e Cloudflare Tunnel.  
**Consequência:** Se no futuro precisar de comunicação bidirecional em tempo real (ex.: terminal interativo de agentes), migrar SSE para WebSocket nessa rota específica.

### ADR-004: Sem monorepo tooling pesado
**Decisão:** O front-end (npm) e o back-end (Go module) convivem no mesmo repositório git mas são projetos independentes — sem Turborepo, Nx ou workspace root compartilhado.  
**Motivo:** Menor complexidade de configuração. Go e npm têm sistemas de módulos completamente separados; forçá-los num monorepo unificado adicionaria configuração sem benefício real.  
**Consequência:** Para rodar tudo, o `start.sh` entra em cada diretório e executa os comandos de cada linguagem separadamente.

### ADR-005: Contratos de API documentados em vez de tipos compartilhados
**Decisão:** Não existe pacote de tipos compartilhados entre front-end e back-end. Os contratos são mantidos na seção 6 deste documento.  
**Motivo:** Com Go no back-end e TypeScript no front-end, compartilhar tipos exigiria geração de código (ex.: `openapi-generator`) que adiciona complexidade desnecessária no MVP.  
**Consequência:** Qualquer mudança de contrato deve ser feita em dois lugares: nos structs Go em `domain/` e nos tipos TypeScript no front-end. Este documento é a fonte de verdade para sincronização.

---

## 11. Changelog

| Data | Versão | Autor | O que mudou |
|---|---|---|---|
| 2026-02-24 | 1.0 | Bruno | Documento criado |
| 2026-02-24 | 1.1 | Bruno | Back-end migrado de Node.js/Fastify para Go/Chi; SQLite driver atualizado para modernc.org/sqlite; node-cron substituído por robfig/cron; npm workspaces removidos; ADRs 002, 004 e 005 atualizados; exemplos de código SSE e integração reescritos em Go |

> **Instrução para agentes:** Ao modificar este documento, adicione uma linha nesta tabela com a data, a versão incrementada, o seu nome (ex.: PLEX) e uma descrição curta da mudança.
