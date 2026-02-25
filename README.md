# Mission Control

Painel web centralizado para operar o ecossistema OpenClaw: tarefas, agentes, agenda, observabilidade e custos em um único lugar.

## Status

Projeto em fase de kick-off com documentação consolidada.

- PRD: [`docs/kick-off/mission-control-prd-v2.md`](docs/kick-off/mission-control-prd-v2.md)
- Arquitetura técnica: [`docs/kick-off/mission-control-architecture.md`](docs/kick-off/mission-control-architecture.md)
- Plano de ondas: [`docs/kick-off/mission-control-wave-plan.md`](docs/kick-off/mission-control-wave-plan.md)
- Changelog: [`CHANGELOG.md`](CHANGELOG.md)
- Protótipos de UI:
  - [`docs/kick-off/prototipos-ui/mission-control-ui.jsx`](docs/kick-off/prototipos-ui/mission-control-ui.jsx)
  - [`docs/kick-off/prototipos-ui/mission-control-tasks.jsx`](docs/kick-off/prototipos-ui/mission-control-tasks.jsx)
  - [`docs/kick-off/prototipos-ui/mission-control-agents.jsx`](docs/kick-off/prototipos-ui/mission-control-agents.jsx)

## MVP (Fase 1)

- Dashboard em tempo real
- Kanban de tarefas
- Gestão de agentes
- Agenda e cron jobs
- Observabilidade básica (sessões, tokens, custos, logs)

## Stack Oficial

- Front-end: Next.js 14 + TypeScript + Tailwind
- Back-end: Go 1.22+ com Chi
- Banco: SQLite (`modernc.org/sqlite`)
- Scheduler: `robfig/cron/v3`
- Real-time: SSE (`/api/stream`)

## Setup de Desenvolvimento

Backend da Onda 1 disponível em `apps/api`.

1. Copie `.env.example` para `.env` (opcional, para customizar variáveis).
2. API:
   - `cd apps/api`
   - `go mod tidy`
   - `make dev` (sobe em `http://localhost:3001`)

Alternativa manual:

- API (a partir da raiz): `go run ./apps/api`

Rotas core implementadas na Onda 1:

- `GET /health`
- `GET /api/dashboard/summary`
- `GET|POST|PATCH|DELETE /api/tasks`
- `GET|POST|PATCH /api/agents`
- `GET|POST /api/activity`
- `GET /api/stream`

## Deploy no Servidor

- Guia de deploy da API para servidor OpenClaw: [`docs/deploy/openclaw-server-api.md`](docs/deploy/openclaw-server-api.md)
- Kit de automacao (installer, smoke test, service template e nginx example): `deploy/openclaw/`

## Integração com OpenClaw

Variáveis esperadas no `.env`:

- `OPENCLAW_API_URL`
- `OPENCLAW_API_TOKEN`

Se `OPENCLAW_API_URL` não estiver definida, o Mission Control roda em modo standalone.

## Contribuição

Consulte [`CONTRIBUTING.md`](CONTRIBUTING.md).
