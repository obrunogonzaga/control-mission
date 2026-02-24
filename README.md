# Mission Control

Painel web centralizado para operar o ecossistema OpenClaw: tarefas, agentes, agenda, observabilidade e custos em um único lugar.

## Status

Projeto em fase de kick-off com documentação consolidada.

- PRD: [`docs/kick-off/mission-control-prd-v2.md`](docs/kick-off/mission-control-prd-v2.md)
- Arquitetura técnica: [`docs/kick-off/mission-control-architecture.md`](docs/kick-off/mission-control-architecture.md)
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

O código-fonte da aplicação (apps/web e apps/api) será adicionado nas próximas etapas.

Quando o scaffold estiver disponível:

1. Copie `.env.example` para `.env`
2. Suba tudo com `./start.sh`

Alternativa manual:

- API: `go run ./apps/api`
- Web: `npm run dev` em `apps/web`

## Integração com OpenClaw

Variáveis esperadas no `.env`:

- `OPENCLAW_API_URL`
- `OPENCLAW_API_TOKEN`

Se `OPENCLAW_API_URL` não estiver definida, o Mission Control roda em modo standalone.

## Contribuição

Consulte [`CONTRIBUTING.md`](CONTRIBUTING.md).
