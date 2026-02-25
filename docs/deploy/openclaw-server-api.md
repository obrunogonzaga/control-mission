# Deploy da API Mission Control no servidor OpenClaw

Este guia sobe a API da Onda 1 como servico `systemd`, com SQLite local e smoke test.

## 1. Pre-requisitos no servidor

- Linux com `systemd`
- Go 1.22+
- `curl` e `jq`
- Acesso root (`sudo`)

Exemplo Debian/Ubuntu:

```bash
sudo apt update
sudo apt install -y golang-go curl jq
```

## 2. Deploy automatico (recomendado)

No servidor, com o repositorio clonado e atualizado:

```bash
cd /caminho/do/control-mission
sudo bash deploy/openclaw/install-api.sh
```

O instalador faz:

- cria usuario/grupo de servico (`missionctl`)
- build da API (`apps/api`) e instala binario em `/opt/mission-control/api`
- copia migrations para `/opt/mission-control/api/migrations`
- cria env em `/etc/mission-control/api.env` (se nao existir)
- cria e ativa `mission-control-api.service`

## 3. Ajustar configuracao

Edite o env e ajuste principalmente `API_TOKEN` e `CORS_ORIGIN`:

```bash
sudo nano /etc/mission-control/api.env
sudo systemctl restart mission-control-api
```

Variaveis padrao:

- `API_HOST=0.0.0.0`
- `API_PORT=3001`
- `DATABASE_PATH=/var/lib/mission-control/mission.db`

## 4. Validar no servidor

```bash
cd /caminho/do/control-mission
API_TOKEN='seu-token' BASE_URL='http://127.0.0.1:3001' bash deploy/openclaw/smoke-test.sh
```

Checks cobertos:

- `GET /health`
- `GET /api/agents`
- `POST/PATCH /api/tasks`
- `GET /api/dashboard/summary`
- `GET /api/stream` + evento `activity`

## 5. Operacao basica

```bash
sudo systemctl status mission-control-api
sudo journalctl -u mission-control-api -n 200 --no-pager
sudo systemctl restart mission-control-api
```

## 6. Upgrade da API

A cada release/commit novo:

```bash
cd /caminho/do/control-mission
git pull --ff-only
sudo bash deploy/openclaw/install-api.sh
```

## 7. Expor via Nginx (opcional)

Template de referencia:

- `deploy/openclaw/nginx-mission-control-api.conf.example`

Ponto critico para SSE:

- `proxy_buffering off`
- `proxy_read_timeout` alto
- rota `/api/stream` dedicada

## 8. Rollback rapido

Se um deploy falhar:

1. restaurar binario anterior em `/opt/mission-control/api/mission-control-api`
2. `sudo systemctl restart mission-control-api`
3. conferir logs com `journalctl`

