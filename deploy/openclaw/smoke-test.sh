#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://127.0.0.1:3001}"
API_TOKEN="${API_TOKEN:-}"
TMP_DIR="$(mktemp -d)"
SSE_PID=""

cleanup() {
  if [[ -n "$SSE_PID" ]]; then
    kill "$SSE_PID" >/dev/null 2>&1 || true
    wait "$SSE_PID" >/dev/null 2>&1 || true
  fi
  rm -rf "$TMP_DIR"
}
trap cleanup EXIT

fail() {
  printf '[smoke-test] ERROR: %s\n' "$*" >&2
  exit 1
}

require_cmd() {
  command -v "$1" >/dev/null 2>&1 || fail "missing command: $1"
}

require_cmd curl
require_cmd jq

if [[ -z "$API_TOKEN" ]]; then
  fail "set API_TOKEN before running this script"
fi

AUTH_HEADER=( -H "Authorization: Bearer ${API_TOKEN}" -H "Content-Type: application/json" )

printf '[smoke-test] health\n'
curl -fsS "${BASE_URL}/health" >"${TMP_DIR}/health.json"
jq '{status,version,uptime_seconds}' "${TMP_DIR}/health.json"

printf '[smoke-test] list agents\n'
curl -fsS "${BASE_URL}/api/agents" "${AUTH_HEADER[@]}" >"${TMP_DIR}/agents.json"
jq '{agents: (.agents | length)}' "${TMP_DIR}/agents.json"

printf '[smoke-test] create task\n'
curl -fsS -X POST "${BASE_URL}/api/tasks" "${AUTH_HEADER[@]}" \
  -d '{"title":"Smoke test task","status":"Backlog","priority":"medium","agent_id":"plex"}' >"${TMP_DIR}/task-created.json"
TASK_ID="$(jq -r '.task.id' "${TMP_DIR}/task-created.json")"
jq '{task_id: .task.id, status: .task.status}' "${TMP_DIR}/task-created.json"

printf '[smoke-test] update task\n'
curl -fsS -X PATCH "${BASE_URL}/api/tasks/${TASK_ID}" "${AUTH_HEADER[@]}" \
  -d '{"status":"In Progress"}' >"${TMP_DIR}/task-updated.json"
jq '{task_id: .task.id, status: .task.status}' "${TMP_DIR}/task-updated.json"

printf '[smoke-test] dashboard summary\n'
curl -fsS "${BASE_URL}/api/dashboard/summary" "${AUTH_HEADER[@]}" >"${TMP_DIR}/summary.json"
jq '{tasks: .tasks, sessions: .sessions, cost: .cost}' "${TMP_DIR}/summary.json"

printf '[smoke-test] sse stream\n'
curl -sN "${BASE_URL}/api/stream" -H "Authorization: Bearer ${API_TOKEN}" >"${TMP_DIR}/sse.log" &
SSE_PID="$!"
sleep 1
curl -fsS -X POST "${BASE_URL}/api/activity" "${AUTH_HEADER[@]}" \
  -d '{"agent_id":"plex","type":"message_sent","message":"sse smoke ping"}' >/dev/null
sleep 1
kill "$SSE_PID" >/dev/null 2>&1 || true
wait "$SSE_PID" >/dev/null 2>&1 || true
SSE_PID=""

if ! grep -q 'event: connected' "${TMP_DIR}/sse.log"; then
  fail "SSE stream missing connected event"
fi
if ! grep -q 'event: activity' "${TMP_DIR}/sse.log"; then
  fail "SSE stream missing activity event"
fi

printf '[smoke-test] done\n'
