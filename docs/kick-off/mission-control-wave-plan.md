# Mission Control — Plano de Execucao em Ondas
**Versao:** 1.0  
**Status:** Ativo  
**Ultima atualizacao:** 2026-02-24

---

## 1. Objetivo

Quebrar a entrega do Mission Control em ondas pequenas, com escopo fechado, criterio claro de conclusao e checkpoint de documentacao ao final de cada ciclo.

---

## 2. Regras Operacionais (Obrigatorias)

### 2.1 Branch obrigatoria para qualquer agente

Ninguem trabalha direto na `main`:

- Codex: `codex/onda-<N>-<slug>`
- Claude: `claude/onda-<N>-<slug>`
- Agentes OpenClaw: `agent/<nome>/onda-<N>-<slug>`

Exemplos:

- `codex/onda-1-api-core`
- `claude/onda-2-kanban-ui`
- `agent/plex/onda-3-agents-module`

### 2.2 Fechamento de ciclo obrigatorio

Ao finalizar um ciclo (PR pronto para review), o responsavel deve:

1. Atualizar o status da onda neste arquivo.
2. Atualizar os docs afetados (PRD, arquitetura, etc.).
3. Adicionar entrada no `CHANGELOG.md`.
4. Abrir PR para `main` (sem push direto na `main`).

---

## 3. Fluxo de Ciclo

### Inicio

```bash
git fetch origin
git checkout main
git pull --ff-only origin main
git checkout -b codex/onda-<N>-<slug>
```

### Encerramento

```bash
git add .
git commit -m "feat: <resumo-do-ciclo>"
git push -u origin <branch>
# abrir PR para main
```

Checklist de encerramento:

- [ ] Onda atualizada em `docs/kick-off/mission-control-wave-plan.md`
- [ ] Changelog atualizado em `CHANGELOG.md`
- [ ] PRD/arquitetura atualizados se houve mudanca de contrato/stack/processo

---

## 4. Ondas

## Onda 0 — Foundation
**Objetivo:** deixar base do repositorio pronta para iniciar implementacao.

**Escopo:**
- estrutura inicial do repo e docs base
- padroes de contribuicao e processo
- repositorio remoto e protecao da `main`

**Criterio de saida:**
- repo funcional com `main` protegida
- docs de processo disponiveis

## Onda 1 — API Core + DB + SSE
**Objetivo:** backend minimo funcional para tarefas/agentes/activity.

**Escopo:**
- app Go com Chi e middlewares basicos
- SQLite (`modernc.org/sqlite`) + migrations iniciais
- endpoints core (`/health`, `/tasks`, `/agents`, `/activity`, `/dashboard/summary`)
- stream SSE (`/api/stream`)

**Criterio de saida:**
- CRUD basico funcionando
- feed e dashboard atualizando por SSE

## Onda 2 — UI Base + Dashboard + Kanban
**Objetivo:** primeira experiencia de uso diario.

**Escopo:**
- shell da aplicacao web (layout + navegacao)
- dashboard consumindo API real
- kanban de tarefas com filtros e drag-and-drop

**Criterio de saida:**
- criar/mover/concluir tarefa pela UI
- dashboard refletindo estado real

## Onda 3 — Agentes + Agenda/Crons
**Objetivo:** operar time de agentes e planejamento de execucao.

**Escopo:**
- modulo de agentes (status, detalhes, comando rapido)
- agenda (eventos manuais + tarefas com vencimento)
- CRUD de crons + scheduler `robfig/cron`

**Criterio de saida:**
- heartbeat de agentes refletindo online/offline
- cron disparando e registrando atividade

## Onda 4 — Observabilidade + Settings + Integracao OpenClaw
**Objetivo:** controle operacional completo.

**Escopo:**
- sessoes, tokens, custos e logs
- settings (limites, timezone, modo demo)
- integracao OpenClaw (send command + contexto)

**Criterio de saida:**
- custo semanal e sessoes visiveis em tempo real
- comandos para agentes funcionando via OpenClaw

## Onda 5 — Hardening + Operacao
**Objetivo:** robustez para uso continuo.

**Escopo:**
- testes de regressao e fluxo E2E critico
- tratamento de erros e fallback de SSE
- refinamento de docs finais de operacao

**Criterio de saida:**
- uso diario sem bloqueios por 2 semanas
- backlog de fase 2 priorizado

---

## 5. Quadro de Status das Ondas

| Onda | Status | Responsavel atual | Inicio | Fim | Observacoes |
|---|---|---|---|---|---|
| 0 | Done | Bruno | 2026-02-24 | 2026-02-24 | Repo criado, branch protection e docs iniciais |
| 1 | Done | Codex | 2026-02-24 | 2026-02-24 | API Go + SQLite + SSE implementada com endpoints core e migrations iniciais |
| 2 | Not Started | - | - | - | - |
| 3 | Not Started | - | - | - | - |
| 4 | Not Started | - | - | - | - |
| 5 | Not Started | - | - | - | - |

---

## 6. Registro de Ciclos (resumo)

| Data | Onda | Branch | Autor | Resultado |
|---|---|---|---|---|
| 2026-02-24 | 0 | `codex/wave-plan-and-agent-rules` | Codex | Plano em ondas criado, regras de branch e fechamento de ciclo adicionadas |
| 2026-02-24 | 1 | `codex/onda-1-api-core` | Codex | Backend Onda 1 entregue com API core (`health/tasks/agents/activity/dashboard`) + SQLite (`modernc`) + migrations + stream SSE (`/api/stream`) |
