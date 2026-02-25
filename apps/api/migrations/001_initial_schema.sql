CREATE TABLE IF NOT EXISTS agents (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  role          TEXT NOT NULL,
  description   TEXT,
  input_signal  TEXT,
  output_action TEXT,
  status        TEXT NOT NULL DEFAULT 'offline',
  soul_md       TEXT,
  last_seen_at  TEXT,
  archived_at   TEXT,
  created_at    TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS projects (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  status      TEXT NOT NULL DEFAULT 'active',
  description TEXT,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS tasks (
  id          TEXT PRIMARY KEY,
  title       TEXT NOT NULL,
  description TEXT,
  status      TEXT NOT NULL,
  priority    TEXT NOT NULL DEFAULT 'medium',
  due_date    TEXT,
  tags        TEXT,
  agent_id    TEXT REFERENCES agents(id),
  project_id  TEXT REFERENCES projects(id),
  created_by  TEXT NOT NULL,
  created_at  TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_agent_id ON tasks(agent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

CREATE TABLE IF NOT EXISTS kanban_columns (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  position    INTEGER NOT NULL,
  color       TEXT,
  created_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS activity (
  id          TEXT PRIMARY KEY,
  agent_id    TEXT REFERENCES agents(id),
  type        TEXT NOT NULL,
  message     TEXT NOT NULL,
  metadata    TEXT,
  level       TEXT NOT NULL DEFAULT 'info',
  read_at     TEXT,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_agent_id ON activity(agent_id);
CREATE INDEX IF NOT EXISTS idx_activity_level ON activity(level);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON activity(created_at);

CREATE TABLE IF NOT EXISTS settings (
  key         TEXT PRIMARY KEY,
  value       TEXT NOT NULL,
  updated_at  TEXT NOT NULL
);

INSERT OR IGNORE INTO kanban_columns (id, name, position, color, created_at) VALUES
  ('col_backlog', 'Backlog', 0, NULL, '2026-02-24T00:00:00Z'),
  ('col_inprogress', 'In Progress', 1, NULL, '2026-02-24T00:00:00Z'),
  ('col_review', 'Review', 2, NULL, '2026-02-24T00:00:00Z'),
  ('col_done', 'Done', 3, NULL, '2026-02-24T00:00:00Z');

INSERT OR IGNORE INTO settings (key, value, updated_at) VALUES
  ('weekly_cost_limit_usd', '20', '2026-02-24T00:00:00Z'),
  ('demo_mode', 'false', '2026-02-24T00:00:00Z'),
  ('log_retention_days', '30', '2026-02-24T00:00:00Z'),
  ('timezone', 'America/Sao_Paulo', '2026-02-24T00:00:00Z');

INSERT OR IGNORE INTO agents (
  id, name, role, description, input_signal, output_action,
  status, soul_md, last_seen_at, archived_at, created_at
) VALUES
  ('tars', 'TARS', 'Chief of Staff', 'Orquestração geral, priorização e agenda.', NULL, NULL, 'offline', NULL, NULL, NULL, '2026-02-24T00:00:00Z'),
  ('case', 'CASE', 'Tech Lead Engineer', 'Responsável pelo projeto Meu Flip.', NULL, NULL, 'offline', NULL, NULL, NULL, '2026-02-24T00:00:00Z'),
  ('kipp', 'KIPP', 'Tech Lead Engineer', 'Responsável pelo projeto Meu Foco.', NULL, NULL, 'offline', NULL, NULL, NULL, '2026-02-24T00:00:00Z'),
  ('plex', 'PLEX', 'Software Engineer', 'Execução de tarefas gerais de engenharia.', NULL, NULL, 'offline', NULL, NULL, NULL, '2026-02-24T00:00:00Z'),
  ('echo', 'ECHO', 'Social Media Manager', 'Distribuição de conteúdo e YouTube.', NULL, NULL, 'offline', NULL, NULL, NULL, '2026-02-24T00:00:00Z');
