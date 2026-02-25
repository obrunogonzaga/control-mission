#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR_DEFAULT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

REPO_DIR="${REPO_DIR:-$REPO_DIR_DEFAULT}"
INSTALL_DIR="${INSTALL_DIR:-/opt/mission-control/api}"
DATA_DIR="${DATA_DIR:-/var/lib/mission-control}"
CONFIG_DIR="${CONFIG_DIR:-/etc/mission-control}"
ENV_FILE="${ENV_FILE:-${CONFIG_DIR}/api.env}"
SERVICE_NAME="${SERVICE_NAME:-mission-control-api}"
SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
APP_USER="${APP_USER:-missionctl}"
APP_GROUP="${APP_GROUP:-missionctl}"
API_HOST="${API_HOST:-0.0.0.0}"
API_PORT="${API_PORT:-3001}"
API_VERSION="${API_VERSION:-1.0.0}"
CORS_ORIGIN="${CORS_ORIGIN:-http://localhost:3000}"
FORCE_ENV_REWRITE="${FORCE_ENV_REWRITE:-false}"
DATABASE_PATH="${DATABASE_PATH:-${DATA_DIR}/mission.db}"

log() {
  printf '[install-api] %s\n' "$*"
}

fail() {
  printf '[install-api] ERROR: %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "missing command: $1"
}

generate_token() {
  if command -v openssl >/dev/null 2>&1; then
    openssl rand -hex 24
    return
  fi

  LC_ALL=C tr -dc 'A-Za-z0-9' </dev/urandom | head -c 48 || true
}

ensure_root() {
  if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
    fail "run as root (example: sudo bash deploy/openclaw/install-api.sh)"
  fi
}

ensure_user_group() {
  if ! getent group "$APP_GROUP" >/dev/null; then
    log "creating group: $APP_GROUP"
    groupadd --system "$APP_GROUP"
  fi

  if ! id -u "$APP_USER" >/dev/null 2>&1; then
    local nologin_bin
    nologin_bin="$(command -v nologin || true)"
    if [[ -z "$nologin_bin" ]]; then
      nologin_bin="/usr/sbin/nologin"
    fi

    log "creating user: $APP_USER"
    useradd \
      --system \
      --gid "$APP_GROUP" \
      --home-dir "$DATA_DIR" \
      --create-home \
      --shell "$nologin_bin" \
      "$APP_USER"
  fi
}

build_binary() {
  local tmp_bin
  tmp_bin="$(mktemp)"

  log "building API binary from ${REPO_DIR}/apps/api"
  (
    cd "${REPO_DIR}/apps/api"
    GOWORK=off CGO_ENABLED=0 go build -trimpath -ldflags "-s -w" -o "$tmp_bin" .
  )

  install -d -m 0755 "$INSTALL_DIR"
  install -m 0755 "$tmp_bin" "${INSTALL_DIR}/mission-control-api"
  rm -f "$tmp_bin"
}

install_migrations() {
  local src_dir
  src_dir="${REPO_DIR}/apps/api/migrations"
  [[ -d "$src_dir" ]] || fail "migrations dir not found: $src_dir"

  rm -rf "${INSTALL_DIR}/migrations"
  mkdir -p "${INSTALL_DIR}/migrations"
  cp -a "${src_dir}/." "${INSTALL_DIR}/migrations/"
}

write_env_file() {
  mkdir -p "$CONFIG_DIR"

  if [[ -f "$ENV_FILE" && "$FORCE_ENV_REWRITE" != "true" ]]; then
    log "env file already exists: $ENV_FILE (keeping current values)"
    return
  fi

  local api_token
  api_token="${API_TOKEN:-$(generate_token)}"

  log "writing env file: $ENV_FILE"
  cat >"$ENV_FILE" <<ENV
API_HOST=${API_HOST}
API_PORT=${API_PORT}
API_TOKEN=${api_token}
API_VERSION=${API_VERSION}
CORS_ORIGIN=${CORS_ORIGIN}
DATABASE_PATH=${DATABASE_PATH}
ENV

  chown "root:${APP_GROUP}" "$ENV_FILE"
  chmod 0640 "$ENV_FILE"
}

write_service_file() {
  log "writing systemd unit: $SERVICE_FILE"
  cat >"$SERVICE_FILE" <<UNIT
[Unit]
Description=Mission Control API
After=network-online.target
Wants=network-online.target

[Service]
Type=simple
User=${APP_USER}
Group=${APP_GROUP}
WorkingDirectory=${INSTALL_DIR}
EnvironmentFile=${ENV_FILE}
ExecStart=${INSTALL_DIR}/mission-control-api
Restart=always
RestartSec=2
NoNewPrivileges=true
PrivateTmp=true
ProtectHome=true
ProtectSystem=full
ReadWritePaths=${DATA_DIR}
LimitNOFILE=65536

[Install]
WantedBy=multi-user.target
UNIT
}

apply_permissions() {
  install -d -m 0755 "$DATA_DIR"
  chown -R root:root "$INSTALL_DIR"
  chown -R "$APP_USER:$APP_GROUP" "$DATA_DIR"
}

reload_and_restart() {
  systemctl daemon-reload
  systemctl enable --now "$SERVICE_NAME"
  systemctl restart "$SERVICE_NAME"
  systemctl --no-pager --full status "$SERVICE_NAME" || true
}

main() {
  ensure_root
  require_cmd go
  require_cmd systemctl

  [[ -f "${REPO_DIR}/apps/api/go.mod" ]] || fail "invalid REPO_DIR: $REPO_DIR"

  ensure_user_group
  build_binary
  install_migrations
  write_env_file
  write_service_file
  apply_permissions
  reload_and_restart

  log "installation complete"
  log "service: ${SERVICE_NAME}"
  log "env file: ${ENV_FILE}"
  log "data db: ${DATABASE_PATH}"
}

main "$@"
