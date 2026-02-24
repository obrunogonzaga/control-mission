import { useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap');`;

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:        #060a0f;
  --surface:   #0b1018;
  --surface2:  #101720;
  --surface3:  #161f2c;
  --border:    #1e2d3d;
  --border2:   #2e4560;
  --cyan:      #00d4ff;
  --cyan-dim:  rgba(0,212,255,0.10);
  --cyan-glow: rgba(0,212,255,0.18);
  --amber:     #ffb020;
  --amber-dim: rgba(255,176,32,0.13);
  --red:       #ff4560;
  --red-dim:   rgba(255,69,96,0.13);
  --green:     #00e096;
  --green-dim: rgba(0,224,150,0.12);
  --purple:    #a78bfa;
  --purple-dim:rgba(167,139,250,0.13);
  --text:      #c8d8e8;
  --text-dim:  #5a7a99;
  --text-faint:#2a4a66;
  --mono:      'Share Tech Mono', monospace;
  --cond:      'Barlow Condensed', sans-serif;
  --body:      'Barlow', sans-serif;
}
body { background: var(--bg); color: var(--text); font-family: var(--body); overflow-x: hidden; }

/* ── Scanlines ── */
.scanlines {
  pointer-events: none; position: fixed; inset: 0; z-index: 9999;
  background: repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.025) 2px, rgba(0,0,0,0.025) 4px);
}

/* ── Sidebar ── */
.sidebar {
  width: 220px; min-height: 100vh;
  background: var(--surface); border-right: 1px solid var(--border);
  display: flex; flex-direction: column;
  position: fixed; left: 0; top: 0; bottom: 0; z-index: 200;
}
.sidebar-logo {
  padding: 20px 16px 16px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 10px;
}
.logo-hex {
  width: 32px; height: 32px;
  background: var(--cyan-dim); border: 1px solid var(--cyan);
  clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  display: flex; align-items: center; justify-content: center; color: var(--cyan);
}
.logo-text { font-family: var(--cond); font-weight: 700; font-size: 15px; letter-spacing: .12em; text-transform: uppercase; }
.logo-sub  { font-family: var(--mono); font-size: 9px; color: var(--text-dim); letter-spacing: .2em; }
.nav-section { padding: 12px 0; }
.nav-label { font-family: var(--mono); font-size: 9px; color: var(--text-faint); letter-spacing: .25em; text-transform: uppercase; padding: 0 16px 6px; }
.nav-item {
  display: flex; align-items: center; gap: 10px;
  padding: 9px 16px; cursor: pointer;
  font-family: var(--cond); font-size: 14px; font-weight: 600;
  letter-spacing: .06em; color: var(--text-dim); text-transform: uppercase;
  position: relative; transition: color .15s; border: none; background: none; width: 100%;
}
.nav-item:hover { color: var(--text); background: rgba(255,255,255,.03); }
.nav-item.active { color: var(--cyan); background: var(--cyan-dim); }
.nav-item.active::before { content:''; position: absolute; left:0; top:0; bottom:0; width:2px; background: var(--cyan); box-shadow: 0 0 8px var(--cyan); }
.nav-icon { font-size: 13px; width: 18px; text-align: center; opacity: .55; }
.nav-item.active .nav-icon { opacity: 1; }
.sidebar-agents { margin-top: auto; padding: 12px 16px; border-top: 1px solid var(--border); }
.agent-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; }
.adot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.adot.running { background: var(--cyan); box-shadow: 0 0 6px var(--cyan); animation: blink 1.5s infinite; }
.adot.online  { background: var(--green); box-shadow: 0 0 5px var(--green); }
.adot.offline { background: var(--text-faint); }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
.aname { font-family: var(--mono); font-size: 11px; color: var(--text-dim); flex:1; }
.arole { font-family: var(--mono); font-size: 9px; color: var(--text-faint); }

/* ── Main ── */
.main { margin-left: 220px; min-height: 100vh; display: flex; flex-direction: column; }

/* ── Topbar ── */
.topbar {
  background: var(--surface); border-bottom: 1px solid var(--border);
  padding: 0 20px; height: 52px; display: flex; align-items: center; gap: 12px;
  position: sticky; top: 0; z-index: 100;
}
.topbar-title { font-family: var(--cond); font-weight: 700; font-size: 18px; letter-spacing: .1em; text-transform: uppercase; }
.topbar-sep { color: var(--text-faint); font-size: 18px; }
.topbar-sub { font-family: var(--mono); font-size: 11px; color: var(--text-dim); }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.btn {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--mono); font-size: 11px; letter-spacing: .08em;
  padding: 6px 12px; border-radius: 2px; cursor: pointer;
  border: 1px solid var(--border); background: var(--surface2); color: var(--text-dim);
  transition: all .15s; text-transform: uppercase;
}
.btn:hover { border-color: var(--border2); color: var(--text); }
.btn.primary { background: var(--cyan-glow); border-color: var(--cyan); color: var(--cyan); }
.btn.primary:hover { background: rgba(0,212,255,.22); }

/* ── Toolbar ── */
.toolbar {
  background: var(--surface); border-bottom: 1px solid var(--border);
  padding: 10px 20px; display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
}
.search-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface2); border: 1px solid var(--border);
  padding: 6px 10px; min-width: 220px;
}
.search-box input {
  background: none; border: none; outline: none;
  font-family: var(--mono); font-size: 11px; color: var(--text);
  width: 180px;
}
.search-box input::placeholder { color: var(--text-faint); }
.search-icon { color: var(--text-faint); font-size: 12px; }
.filter-group { display: flex; gap: 6px; align-items: center; }
.filter-label { font-family: var(--mono); font-size: 9px; color: var(--text-faint); letter-spacing: .15em; }
.filter-chip {
  font-family: var(--mono); font-size: 10px; letter-spacing: .06em;
  padding: 4px 10px; border-radius: 2px; cursor: pointer;
  border: 1px solid var(--border); background: transparent; color: var(--text-dim);
  transition: all .15s; text-transform: uppercase;
}
.filter-chip:hover { border-color: var(--border2); color: var(--text); }
.filter-chip.active { border-color: var(--cyan); color: var(--cyan); background: var(--cyan-dim); }
.filter-chip.amber.active { border-color: var(--amber); color: var(--amber); background: var(--amber-dim); }
.filter-chip.red.active   { border-color: var(--red);   color: var(--red);   background: var(--red-dim); }
.filter-chip.green.active { border-color: var(--green); color: var(--green); background: var(--green-dim); }
.toolbar-right { margin-left: auto; display: flex; gap: 6px; }
.view-btn { font-family: var(--mono); font-size: 11px; padding: 5px 9px; border: 1px solid var(--border); background: transparent; color: var(--text-dim); cursor: pointer; }
.view-btn.active { border-color: var(--border2); color: var(--text); background: var(--surface2); }

/* ── Stats bar ── */
.stats-bar {
  display: flex; gap: 0; border-bottom: 1px solid var(--border);
  background: var(--surface);
}
.stat-cell {
  flex: 1; padding: 8px 20px; border-right: 1px solid var(--border);
  display: flex; align-items: center; gap: 10px;
}
.stat-cell:last-child { border-right: none; }
.stat-num { font-family: var(--mono); font-size: 22px; }
.stat-num.cyan  { color: var(--cyan); }
.stat-num.amber { color: var(--amber); }
.stat-num.green { color: var(--green); }
.stat-num.red   { color: var(--red); }
.stat-label { font-family: var(--mono); font-size: 9px; color: var(--text-dim); letter-spacing: .15em; text-transform: uppercase; line-height: 1.4; }

/* ── Kanban ── */
.kanban-area { flex: 1; padding: 16px 20px; overflow-x: auto; }
.kanban-board { display: flex; gap: 14px; min-width: max-content; align-items: flex-start; }

.col {
  width: 280px; flex-shrink: 0;
  background: var(--surface); border: 1px solid var(--border);
  display: flex; flex-direction: column;
}
.col-header {
  padding: 10px 12px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 8px;
}
.col-stripe { width: 3px; height: 16px; border-radius: 1px; flex-shrink: 0; }
.col-name { font-family: var(--cond); font-weight: 700; font-size: 13px; letter-spacing: .12em; text-transform: uppercase; flex: 1; }
.col-count {
  font-family: var(--mono); font-size: 10px; color: var(--text-faint);
  background: var(--surface2); padding: 2px 7px; border-radius: 2px;
}
.col-body { padding: 10px 10px; display: flex; flex-direction: column; gap: 8px; min-height: 80px; }

/* ── Task Card ── */
.task-card {
  background: var(--surface2); border: 1px solid var(--border);
  border-left: 3px solid transparent;
  padding: 10px 10px 8px;
  cursor: pointer; transition: border-color .15s, transform .1s, background .15s;
  position: relative;
}
.task-card:hover { background: var(--surface3); border-color: var(--border2); transform: translateY(-1px); }
.task-card:active { transform: translateY(0); }
.task-card.p-high   { border-left-color: var(--red); }
.task-card.p-medium { border-left-color: var(--amber); }
.task-card.p-low    { border-left-color: var(--text-faint); }

.task-card.selected {
  border-color: var(--cyan) !important;
  background: rgba(0,212,255,.05);
  box-shadow: 0 0 0 1px var(--cyan);
}

.card-top { display: flex; align-items: flex-start; gap: 6px; margin-bottom: 6px; }
.card-title { font-family: var(--body); font-size: 13px; color: var(--text); line-height: 1.35; flex: 1; }
.card-grip { color: var(--text-faint); font-size: 12px; opacity: 0; transition: opacity .15s; cursor: grab; padding-top: 1px; }
.task-card:hover .card-grip { opacity: 1; }

.card-tags { display: flex; flex-wrap: wrap; gap: 4px; margin-bottom: 8px; }
.card-tag {
  font-family: var(--mono); font-size: 9px; letter-spacing: .05em;
  padding: 2px 6px; border-radius: 2px; text-transform: lowercase;
}
.tag-backend  { background: rgba(0,212,255,.1);   color: var(--cyan);   border: 1px solid rgba(0,212,255,.2); }
.tag-frontend { background: rgba(167,139,250,.1); color: var(--purple); border: 1px solid rgba(167,139,250,.2); }
.tag-infra    { background: rgba(0,224,150,.1);   color: var(--green);  border: 1px solid rgba(0,224,150,.2); }
.tag-content  { background: rgba(255,176,32,.1);  color: var(--amber);  border: 1px solid rgba(255,176,32,.2); }
.tag-design   { background: rgba(255,69,96,.1);   color: var(--red);    border: 1px solid rgba(255,69,96,.2); }

.card-footer { display: flex; align-items: center; gap: 6px; }
.card-agent {
  font-family: var(--mono); font-size: 9px; color: var(--cyan); letter-spacing: .06em;
  background: var(--cyan-dim); padding: 2px 6px; border-radius: 2px;
}
.card-priority {
  font-family: var(--mono); font-size: 9px; letter-spacing: .06em;
  padding: 2px 6px; border-radius: 2px;
}
.card-priority.high   { color: var(--red);   background: var(--red-dim); }
.card-priority.medium { color: var(--amber); background: var(--amber-dim); }
.card-priority.low    { color: var(--text-faint); background: rgba(255,255,255,.04); }

.card-due { font-family: var(--mono); font-size: 9px; color: var(--text-faint); margin-left: auto; }
.card-due.overdue { color: var(--red); }

.col-add-btn {
  margin: 0 10px 10px; padding: 7px;
  border: 1px dashed var(--border); background: transparent; cursor: pointer;
  font-family: var(--mono); font-size: 10px; color: var(--text-faint); letter-spacing: .1em;
  text-transform: uppercase; transition: all .15s; display: flex; align-items: center; justify-content: center; gap: 6px;
}
.col-add-btn:hover { border-color: var(--border2); color: var(--text-dim); background: rgba(255,255,255,.02); }

/* ── Task Detail Panel ── */
.detail-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,.6); backdrop-filter: blur(2px);
  display: flex; justify-content: flex-end;
  animation: fadeIn .15s ease;
}
@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
.detail-panel {
  width: 440px; height: 100vh; background: var(--surface);
  border-left: 1px solid var(--border); overflow-y: auto;
  animation: slideIn .18s ease;
  display: flex; flex-direction: column;
}
@keyframes slideIn { from { transform: translateX(24px); opacity: 0 } to { transform: none; opacity: 1 } }

.detail-panel::-webkit-scrollbar { width: 3px; }
.detail-panel::-webkit-scrollbar-thumb { background: var(--border2); }

.detail-header {
  padding: 16px 20px; border-bottom: 1px solid var(--border);
  display: flex; align-items: center; gap: 10px; position: sticky; top: 0;
  background: var(--surface); z-index: 10;
}
.detail-status {
  font-family: var(--mono); font-size: 10px; letter-spacing: .1em; text-transform: uppercase;
  padding: 4px 10px; background: var(--cyan-dim); border: 1px solid rgba(0,212,255,.3); color: var(--cyan);
}
.detail-close {
  margin-left: auto; background: none; border: none; color: var(--text-dim); cursor: pointer;
  font-family: var(--mono); font-size: 18px; line-height: 1; padding: 2px 6px;
  transition: color .15s;
}
.detail-close:hover { color: var(--text); }

.detail-body { padding: 20px; flex: 1; }

.detail-title {
  font-family: var(--cond); font-weight: 700; font-size: 22px; letter-spacing: .04em;
  color: var(--text); margin-bottom: 14px; line-height: 1.2;
}

.detail-row { display: flex; gap: 8px; margin-bottom: 14px; flex-wrap: wrap; }

.detail-meta-item { display: flex; flex-direction: column; gap: 3px; }
.detail-meta-label {
  font-family: var(--mono); font-size: 9px; color: var(--text-faint);
  letter-spacing: .18em; text-transform: uppercase;
}
.detail-meta-value {
  font-family: var(--mono); font-size: 11px; color: var(--text);
  padding: 4px 9px; background: var(--surface2); border: 1px solid var(--border);
}
.detail-meta-value.cyan  { color: var(--cyan); border-color: rgba(0,212,255,.25); background: var(--cyan-dim); }
.detail-meta-value.amber { color: var(--amber); border-color: rgba(255,176,32,.25); background: var(--amber-dim); }
.detail-meta-value.red   { color: var(--red);   border-color: rgba(255,69,96,.25);  background: var(--red-dim); }

.detail-section-label {
  font-family: var(--mono); font-size: 9px; color: var(--text-faint);
  letter-spacing: .18em; text-transform: uppercase;
  margin-bottom: 8px; margin-top: 20px;
  display: flex; align-items: center; gap: 8px;
}
.detail-section-label::after { content: ''; flex: 1; height: 1px; background: var(--border); }

.detail-description {
  font-family: var(--body); font-size: 13px; color: var(--text-dim);
  line-height: 1.6; padding: 12px 14px;
  background: var(--surface2); border: 1px solid var(--border);
}

.detail-tags { display: flex; flex-wrap: wrap; gap: 6px; }

.detail-activity-item {
  display: flex; gap: 10px; padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.detail-activity-item:last-child { border: none; }
.dact-time { font-family: var(--mono); font-size: 9px; color: var(--text-faint); min-width: 44px; padding-top: 1px; }
.dact-body { font-family: var(--body); font-size: 12px; color: var(--text-dim); line-height: 1.4; }
.dact-body strong { color: var(--text); font-weight: 500; }

.detail-footer {
  padding: 14px 20px; border-top: 1px solid var(--border);
  display: flex; gap: 8px;
}
.btn-danger { border-color: rgba(255,69,96,.35); color: var(--red); background: var(--red-dim); }
.btn-danger:hover { border-color: var(--red); }

/* ── New task inline ── */
.new-task-form {
  background: var(--surface2); border: 1px solid var(--cyan);
  padding: 10px;
  box-shadow: 0 0 12px rgba(0,212,255,.08);
}
.new-task-input {
  background: none; border: none; outline: none; width: 100%;
  font-family: var(--body); font-size: 13px; color: var(--text);
  margin-bottom: 8px;
}
.new-task-input::placeholder { color: var(--text-faint); }
.new-task-actions { display: flex; gap: 6px; }
.new-task-save {
  font-family: var(--mono); font-size: 10px; padding: 5px 12px;
  background: var(--cyan-glow); border: 1px solid var(--cyan); color: var(--cyan);
  cursor: pointer; letter-spacing: .08em; text-transform: uppercase;
}
.new-task-cancel {
  font-family: var(--mono); font-size: 10px; padding: 5px 10px;
  background: transparent; border: 1px solid var(--border); color: var(--text-dim);
  cursor: pointer; letter-spacing: .08em; text-transform: uppercase;
}
`;

// ─── Data ───────────────────────────────────────────────────────────────────

const AGENTS_LIST = [
  { id: "tars", name: "TARS", role: "Chief of Staff", status: "running" },
  { id: "case", name: "CASE", role: "Tech Lead / Flip", status: "online" },
  { id: "kipp", name: "KIPP", role: "Tech Lead / Foco", status: "offline" },
  { id: "plex", name: "PLEX", role: "Software Eng.", status: "running" },
  { id: "echo", name: "ECHO", role: "Social Media", status: "online" },
];

const COL_COLORS = {
  "Backlog":     "#5a7a99",
  "In Progress": "#00d4ff",
  "Review":      "#ffb020",
  "Done":        "#00e096",
};

const INITIAL_TASKS = {
  "Backlog": [
    { id: "t1", title: "Integrar Discord bot ao Mission Control", agent: "PLEX", priority: "medium", due: "Mar 3", tags: ["backend"], description: "Implementar o handler de events do Discord usando discordgo. Bot deve receber comandos e publicar no feed de atividade.", activity: [{ time: "Feb 24", text: "<strong>TARS</strong> criou esta tarefa" }] },
    { id: "t2", title: "SOUL.md inicial para ECHO", agent: "TARS", priority: "low", due: "Mar 5", tags: ["content"], description: "Escrever o prompt inicial do agente ECHO com foco em gestão de canal YouTube e redes sociais.", activity: [{ time: "Feb 23", text: "<strong>TARS</strong> adicionou à fila" }] },
    { id: "t3", title: "Dashboard de métricas YouTube", agent: "ECHO", priority: "medium", due: "Mar 8", tags: ["frontend", "content"], description: "Módulo de analytics integrado com a YouTube Data API.", activity: [] },
  ],
  "In Progress": [
    { id: "t4", title: "Autenticação JWT no Meu Foco", agent: "PLEX", priority: "high", due: "Feb 26", tags: ["backend", "infra"], description: "Implementar fluxo completo de auth: login, refresh token, middleware de proteção de rotas.", activity: [{ time: "Feb 24 15:42", text: "<strong>PLEX</strong> iniciou implementação" }, { time: "Feb 23", text: "<strong>TARS</strong> atribuiu a PLEX" }] },
    { id: "t5", title: "Roteiro — Vídeo #03: IA no trabalho", agent: "ECHO", priority: "medium", due: "Feb 28", tags: ["content"], description: "Roteiro completo com introdução, 4 blocos de conteúdo e CTA. Duração alvo: 12 minutos.", activity: [{ time: "Feb 24 15:20", text: "<strong>ECHO</strong> publicou rascunho v1" }] },
    { id: "t6", title: "Setup CI/CD pipeline Meu Flip", agent: "CASE", priority: "high", due: "Feb 25", overdue: true, tags: ["infra"], description: "GitHub Actions para build, test e deploy automático no branch main.", activity: [{ time: "Feb 24", text: "<strong>CASE</strong> em progresso" }, { time: "Feb 22", text: "<strong>CASE</strong> criou tarefa" }] },
  ],
  "Review": [
    { id: "t7", title: "PRD Mission Control v2", agent: "TARS", priority: "medium", due: "Feb 24", tags: ["content"], description: "Revisão final do documento de requisitos. Verificar consistência com a arquitetura técnica.", activity: [{ time: "Feb 24 14:45", text: "<strong>TARS</strong> moveu para Review" }] },
    { id: "t8", title: "Arquitetura Go backend", agent: "PLEX", priority: "high", due: "Feb 24", tags: ["backend", "infra"], description: "Documento de arquitetura técnica com stack Go + Chi + SQLite. Validar estrutura de pastas e contratos de API.", activity: [{ time: "Feb 24 14:00", text: "<strong>PLEX</strong> moveu para Review" }] },
  ],
  "Done": [
    { id: "t9", title: "Kanban schema migration SQL", agent: "PLEX", priority: "low", due: "Feb 23", tags: ["backend"], description: "Migration 001: tabelas iniciais + índices.", activity: [{ time: "Feb 23", text: "<strong>PLEX</strong> concluiu" }] },
    { id: "t10", title: "Onboarding doc para agentes", agent: "TARS", priority: "medium", due: "Feb 22", tags: ["content"], description: "AGENTS.md com instruções de como os agentes devem interagir com o Mission Control.", activity: [] },
    { id: "t11", title: "Template de thumbnail ECHO", agent: "ECHO", priority: "low", due: "Feb 21", tags: ["design", "content"], description: "Template padrão para thumbnails do canal com identidade visual consistente.", activity: [] },
  ],
};

const NAV = [
  { icon: "⬡", label: "Dashboard" },
  { icon: "▦", label: "Tarefas", active: true },
  { icon: "◈", label: "Agentes" },
  { icon: "◷", label: "Agenda" },
  { icon: "◉", label: "Observabilidade", badge: 2 },
  { icon: "⋮", label: "Configurações" },
];

const TAG_CLASS = { backend: "tag-backend", frontend: "tag-frontend", infra: "tag-infra", content: "tag-content", design: "tag-design" };

// ─── Component ──────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [filterAgent, setFilterAgent] = useState(null);
  const [filterPriority, setFilterPriority] = useState(null);
  const [addingTo, setAddingTo] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [dragging, setDragging] = useState(null); // { taskId, fromCol }
  const [dragOver, setDragOver] = useState(null);

  const selectedTask = selected
    ? Object.values(tasks).flat().find(t => t.id === selected)
    : null;

  function handleAddTask(col) {
    if (!newTitle.trim()) { setAddingTo(null); return; }
    const id = "t" + Date.now();
    const task = { id, title: newTitle.trim(), agent: "TARS", priority: "medium", due: "—", tags: [], description: "", activity: [{ time: "agora", text: "<strong>Você</strong> criou esta tarefa" }] };
    setTasks(prev => ({ ...prev, [col]: [task, ...prev[col]] }));
    setNewTitle("");
    setAddingTo(null);
  }

  function moveTask(taskId, fromCol, toCol) {
    if (fromCol === toCol) return;
    setTasks(prev => {
      const task = prev[fromCol].find(t => t.id === taskId);
      if (!task) return prev;
      return {
        ...prev,
        [fromCol]: prev[fromCol].filter(t => t.id !== taskId),
        [toCol]: [...prev[toCol], task],
      };
    });
  }

  function handleDrop(e, toCol) {
    e.preventDefault();
    if (dragging) { moveTask(dragging.taskId, dragging.fromCol, toCol); }
    setDragging(null); setDragOver(null);
  }

  function filterTasks(colTasks) {
    return colTasks.filter(t => {
      const matchSearch = !search || t.title.toLowerCase().includes(search.toLowerCase());
      const matchAgent = !filterAgent || t.agent === filterAgent;
      const matchPriority = !filterPriority || t.priority === filterPriority;
      return matchSearch && matchAgent && matchPriority;
    });
  }

  const allTasks = Object.values(tasks).flat();
  const total = allTasks.length;
  const inProgress = tasks["In Progress"].length;
  const overdue = allTasks.filter(t => t.overdue).length;
  const doneWeek = tasks["Done"].length;

  return (
    <>
      <style>{FONTS}</style>
      <style>{CSS}</style>
      <div className="scanlines" />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-hex">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5"/>
              <line x1="12" y1="2" x2="12" y2="22"/><line x1="2" y1="8.5" x2="22" y2="8.5"/><line x1="2" y1="15.5" x2="22" y2="15.5"/>
            </svg>
          </div>
          <div><div className="logo-text">Mission Control</div><div className="logo-sub">OpenClaw v1.1</div></div>
        </div>
        <nav className="nav-section">
          <div className="nav-label">Navigation</div>
          {NAV.map(n => (
            <button key={n.label} className={`nav-item ${n.active ? "active" : ""}`}>
              <span className="nav-icon">{n.icon}</span>
              {n.label}
              {n.badge && <span style={{ marginLeft: "auto", background: "var(--red)", color: "#fff", fontFamily: "var(--mono)", fontSize: 10, padding: "1px 5px", borderRadius: 2 }}>{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-agents">
          <div className="nav-label" style={{ marginBottom: 8 }}>Agents</div>
          {AGENTS_LIST.map(a => (
            <div key={a.id} className="agent-row">
              <div className={`adot ${a.status}`} />
              <div className="aname">{a.name}</div>
              <div className="arole">{a.status.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Topbar */}
        <header className="topbar">
          <div className="topbar-title">Tarefas</div>
          <span className="topbar-sep">/</span>
          <span className="topbar-sub">Kanban Board</span>
          <div className="topbar-right">
            <button className="btn">⬇ Exportar</button>
            <button className="btn primary" onClick={() => setAddingTo("Backlog")}>+ Nova Tarefa</button>
          </div>
        </header>

        {/* Stats bar */}
        <div className="stats-bar">
          {[
            { label: "Total\nAtiVAS", value: total, cls: "cyan" },
            { label: "Em\nProgresso", value: inProgress, cls: "cyan" },
            { label: "Concluídas\nEsta Semana", value: doneWeek, cls: "green" },
            { label: "Em\nAtraso", value: overdue, cls: overdue > 0 ? "red" : "green" },
          ].map(s => (
            <div key={s.label} className="stat-cell">
              <div className={`stat-num ${s.cls}`}>{s.value}</div>
              <div className="stat-label" style={{ whiteSpace: "pre-line" }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span className="search-icon">⌕</span>
            <input
              placeholder="Buscar tarefas..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <span className="filter-label">Agente</span>
            {["TARS","CASE","KIPP","PLEX","ECHO"].map(a => (
              <button
                key={a}
                className={`filter-chip ${filterAgent === a ? "active" : ""}`}
                onClick={() => setFilterAgent(filterAgent === a ? null : a)}
              >{a}</button>
            ))}
          </div>

          <div className="filter-group">
            <span className="filter-label">Prioridade</span>
            {[["high","red"],["medium","amber"],["low",""]].map(([p, c]) => (
              <button
                key={p}
                className={`filter-chip ${c} ${filterPriority === p ? "active" : ""}`}
                onClick={() => setFilterPriority(filterPriority === p ? null : p)}
              >{p}</button>
            ))}
          </div>

          <div className="toolbar-right">
            <button className="view-btn active">▦ Board</button>
            <button className="view-btn">≡ List</button>
          </div>
        </div>

        {/* Kanban */}
        <div className="kanban-area">
          <div className="kanban-board">
            {Object.entries(tasks).map(([col, colTasks]) => {
              const visible = filterTasks(colTasks);
              const isOver = dragOver === col;
              return (
                <div
                  key={col}
                  className="col"
                  style={isOver ? { borderColor: "var(--cyan)", background: "rgba(0,212,255,.03)" } : {}}
                  onDragOver={e => { e.preventDefault(); setDragOver(col); }}
                  onDragLeave={() => setDragOver(null)}
                  onDrop={e => handleDrop(e, col)}
                >
                  <div className="col-header">
                    <div className="col-stripe" style={{ background: COL_COLORS[col] }} />
                    <span className="col-name">{col}</span>
                    <span className="col-count">{visible.length}</span>
                  </div>

                  <div className="col-body">
                    {/* New task form */}
                    {addingTo === col && (
                      <div className="new-task-form">
                        <input
                          className="new-task-input"
                          placeholder="Título da tarefa..."
                          value={newTitle}
                          onChange={e => setNewTitle(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") handleAddTask(col); if (e.key === "Escape") { setAddingTo(null); setNewTitle(""); } }}
                          autoFocus
                        />
                        <div className="new-task-actions">
                          <button className="new-task-save" onClick={() => handleAddTask(col)}>↵ Salvar</button>
                          <button className="new-task-cancel" onClick={() => { setAddingTo(null); setNewTitle(""); }}>Esc</button>
                        </div>
                      </div>
                    )}

                    {visible.map(task => (
                      <div
                        key={task.id}
                        className={`task-card p-${task.priority} ${selected === task.id ? "selected" : ""}`}
                        onClick={() => setSelected(selected === task.id ? null : task.id)}
                        draggable
                        onDragStart={() => setDragging({ taskId: task.id, fromCol: col })}
                        onDragEnd={() => { setDragging(null); setDragOver(null); }}
                      >
                        <div className="card-top">
                          <div className="card-title">{task.title}</div>
                          <div className="card-grip">⠿</div>
                        </div>

                        {task.tags.length > 0 && (
                          <div className="card-tags">
                            {task.tags.map(tag => (
                              <span key={tag} className={`card-tag ${TAG_CLASS[tag] || ""}`}>{tag}</span>
                            ))}
                          </div>
                        )}

                        <div className="card-footer">
                          <span className="card-agent">{task.agent}</span>
                          <span className={`card-priority ${task.priority}`}>{task.priority}</span>
                          <span className={`card-due ${task.overdue ? "overdue" : ""}`}>{task.overdue ? "⚠ " : ""}{task.due}</span>
                        </div>
                      </div>
                    ))}

                    {visible.length === 0 && !addingTo && (
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)", textAlign: "center", padding: "20px 0" }}>
                        {search || filterAgent || filterPriority ? "Nenhum resultado" : "Vazio"}
                      </div>
                    )}
                  </div>

                  <button className="col-add-btn" onClick={() => { setAddingTo(col); setNewTitle(""); }}>
                    + Adicionar
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      {/* Task Detail Panel */}
      {selectedTask && (
        <div className="detail-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="detail-panel">
            <div className="detail-header">
              <div className="detail-status">
                {Object.entries(tasks).find(([, t]) => t.find(x => x.id === selectedTask.id))?.[0] || "—"}
              </div>
              <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)", letterSpacing: ".06em" }}>
                #{selectedTask.id}
              </div>
              <button className="detail-close" onClick={() => setSelected(null)}>×</button>
            </div>

            <div className="detail-body">
              <div className="detail-title">{selectedTask.title}</div>

              <div className="detail-row">
                <div className="detail-meta-item">
                  <div className="detail-meta-label">Agente</div>
                  <div className="detail-meta-value cyan">{selectedTask.agent}</div>
                </div>
                <div className="detail-meta-item">
                  <div className="detail-meta-label">Prioridade</div>
                  <div className={`detail-meta-value ${selectedTask.priority === "high" ? "red" : selectedTask.priority === "medium" ? "amber" : ""}`}>
                    {selectedTask.priority}
                  </div>
                </div>
                <div className="detail-meta-item">
                  <div className="detail-meta-label">Vencimento</div>
                  <div className={`detail-meta-value ${selectedTask.overdue ? "red" : ""}`}>
                    {selectedTask.overdue ? "⚠ " : ""}{selectedTask.due}
                  </div>
                </div>
              </div>

              {selectedTask.tags.length > 0 && (
                <>
                  <div className="detail-section-label">Tags</div>
                  <div className="detail-tags">
                    {selectedTask.tags.map(tag => (
                      <span key={tag} className={`card-tag ${TAG_CLASS[tag] || ""}`}>{tag}</span>
                    ))}
                  </div>
                </>
              )}

              <div className="detail-section-label">Descrição</div>
              <div className="detail-description">
                {selectedTask.description || <span style={{ color: "var(--text-faint)" }}>Sem descrição.</span>}
              </div>

              <div className="detail-section-label">Mover para</div>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {Object.keys(tasks).map(col => {
                  const currentCol = Object.entries(tasks).find(([, t]) => t.find(x => x.id === selectedTask.id))?.[0];
                  const isCurrent = col === currentCol;
                  return (
                    <button
                      key={col}
                      className={`filter-chip ${isCurrent ? "active" : ""}`}
                      onClick={() => { if (!isCurrent) moveTask(selectedTask.id, currentCol, col); }}
                      style={isCurrent ? { borderColor: COL_COLORS[col], color: COL_COLORS[col], background: "rgba(255,255,255,.04)" } : {}}
                    >{col}</button>
                  );
                })}
              </div>

              {selectedTask.activity.length > 0 && (
                <>
                  <div className="detail-section-label">Histórico</div>
                  {selectedTask.activity.map((a, i) => (
                    <div key={i} className="detail-activity-item">
                      <div className="dact-time">{a.time}</div>
                      <div className="dact-body" dangerouslySetInnerHTML={{ __html: a.body || a.text }} />
                    </div>
                  ))}
                </>
              )}
            </div>

            <div className="detail-footer">
              <button className="btn" style={{ flex: 1 }}>✎ Editar</button>
              <button className="btn btn-danger">✕ Deletar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
