# Changelog

Todas as mudanças relevantes deste projeto devem ser registradas aqui ao final de cada ciclo/PR.

Formato sugerido:

- Data
- Onda
- Branch
- Tipo de mudança
- Resumo objetivo
- Docs atualizados

---

## 2026-02-24

### docs

- Onda: 0
- Branch: `codex/wave-plan-and-agent-rules`
- Resumo: criado plano de execucao em ondas, regras obrigatorias de branch para agentes (Codex/Claude/OpenClaw) e ritual de fechamento de ciclo com atualizacao de status + changelog.
- Docs atualizados:
  - `docs/kick-off/mission-control-wave-plan.md`
  - `CONTRIBUTING.md`
  - `README.md`

### feat

- Onda: 1
- Branch: `codex/onda-1-api-core`
- Resumo: implementado backend base em Go + Chi com SQLite (`modernc.org/sqlite`), migration inicial, CRUD de tarefas/agentes/activity, dashboard summary e stream SSE em `/api/stream`.
- Detalhes principais:
  - API e middlewares: `GET /health`, `GET /api/dashboard/summary`, CRUD em `/api/tasks`, `/api/agents`, `/api/activity`, e `GET /api/stream`.
  - Persistência: conexão SQLite com WAL + runner de migrations SQL versionadas.
  - Real-time: broker SSE com eventos `connected`, `activity`, `tasks:update`, `tasks:delete`, `agents:update` e `ping`.
  - Seed inicial na migration: agentes padrão (TARS/CASE/KIPP/PLEX/ECHO), colunas padrão do Kanban e settings base.
- Docs atualizados:
  - `docs/kick-off/mission-control-wave-plan.md`
  - `README.md`

### ops

- Onda: 1 (suporte de operacao)
- Branch: `codex/onda-1-api-core`
- Resumo: adicionado kit de deploy para servidor OpenClaw com instalacao automatizada da API via `systemd`, templates de ambiente e smoke test de validacao.
- Itens adicionados:
  - `deploy/openclaw/install-api.sh`
  - `deploy/openclaw/smoke-test.sh`
  - `deploy/openclaw/mission-control-api.service`
  - `deploy/openclaw/api.env.example`
  - `deploy/openclaw/nginx-mission-control-api.conf.example`
  - `docs/deploy/openclaw-server-api.md`
