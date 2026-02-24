import { useState } from "react";

const FONTS = `
  @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap');
`;

const CSS = `
  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg:        #060a0f;
    --surface:   #0b1018;
    --surface2:  #101720;
    --surface3:  #161f2c;
    --border:    #1e2d3d;
    --border2:   #243547;
    --cyan:      #00d4ff;
    --cyan-dim:  #00a8cc;
    --cyan-glow: rgba(0,212,255,0.12);
    --amber:     #ffb020;
    --amber-dim: rgba(255,176,32,0.15);
    --red:       #ff4560;
    --red-dim:   rgba(255,69,96,0.15);
    --green:     #00e096;
    --green-dim: rgba(0,224,150,0.12);
    --text:      #c8d8e8;
    --text-dim:  #5a7a99;
    --text-faint:#2a4a66;
    --mono:      'Share Tech Mono', monospace;
    --condensed: 'Barlow Condensed', sans-serif;
    --body:      'Barlow', sans-serif;
  }

  body { background: var(--bg); color: var(--text); font-family: var(--body); }

  .scanlines {
    pointer-events: none;
    position: fixed; inset: 0; z-index: 9999;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.03) 2px,
      rgba(0,0,0,0.03) 4px
    );
  }

  /* Sidebar */
  .sidebar {
    width: 220px; min-height: 100vh;
    background: var(--surface);
    border-right: 1px solid var(--border);
    display: flex; flex-direction: column;
    position: fixed; left: 0; top: 0; bottom: 0;
  }

  .sidebar-logo {
    padding: 20px 16px 16px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 10px;
  }

  .logo-mark {
    width: 32px; height: 32px;
    background: var(--cyan-glow);
    border: 1px solid var(--cyan);
    display: flex; align-items: center; justify-content: center;
    clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
  }

  .logo-mark svg { color: var(--cyan); }

  .logo-text {
    font-family: var(--condensed);
    font-weight: 700; font-size: 15px;
    letter-spacing: 0.12em;
    color: var(--text);
    text-transform: uppercase;
  }

  .logo-sub {
    font-family: var(--mono);
    font-size: 9px; color: var(--text-dim);
    letter-spacing: 0.2em; text-transform: uppercase;
  }

  .nav-section { padding: 12px 0; }

  .nav-label {
    font-family: var(--mono); font-size: 9px;
    color: var(--text-faint); letter-spacing: 0.25em;
    text-transform: uppercase;
    padding: 0 16px 6px;
  }

  .nav-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 16px; cursor: pointer;
    font-family: var(--condensed); font-size: 14px;
    font-weight: 600; letter-spacing: 0.06em;
    color: var(--text-dim); text-transform: uppercase;
    position: relative; transition: color 0.15s;
    border: none; background: none; width: 100%; text-align: left;
  }

  .nav-item:hover { color: var(--text); background: rgba(255,255,255,0.03); }

  .nav-item.active {
    color: var(--cyan);
    background: var(--cyan-glow);
  }

  .nav-item.active::before {
    content: ''; position: absolute; left: 0; top: 0; bottom: 0;
    width: 2px; background: var(--cyan);
    box-shadow: 0 0 8px var(--cyan);
  }

  .nav-badge {
    margin-left: auto;
    background: var(--red); color: white;
    font-family: var(--mono); font-size: 10px;
    padding: 1px 5px; border-radius: 2px;
    min-width: 18px; text-align: center;
  }

  .sidebar-footer {
    margin-top: auto;
    padding: 12px 16px;
    border-top: 1px solid var(--border);
  }

  .agent-status-row {
    display: flex; align-items: center; gap: 8px;
    padding: 6px 0; cursor: pointer;
  }

  .agent-dot {
    width: 6px; height: 6px; border-radius: 50%;
    flex-shrink: 0;
  }

  .dot-online  { background: var(--green); box-shadow: 0 0 6px var(--green); }
  .dot-running { background: var(--cyan);  box-shadow: 0 0 6px var(--cyan); animation: pulse 1.5s infinite; }
  .dot-offline { background: var(--text-faint); }

  @keyframes pulse {
    0%, 100% { opacity: 1; } 50% { opacity: 0.3; }
  }

  .agent-name {
    font-family: var(--mono); font-size: 11px; color: var(--text-dim);
    flex: 1;
  }

  .agent-role {
    font-family: var(--mono); font-size: 9px; color: var(--text-faint);
  }

  /* Main */
  .main { margin-left: 220px; min-height: 100vh; }

  /* Topbar */
  .topbar {
    background: var(--surface); border-bottom: 1px solid var(--border);
    padding: 0 24px; height: 52px;
    display: flex; align-items: center; gap: 16px;
    position: sticky; top: 0; z-index: 100;
  }

  .topbar-title {
    font-family: var(--condensed); font-weight: 700;
    font-size: 18px; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--text);
  }

  .topbar-breadcrumb {
    font-family: var(--mono); font-size: 11px; color: var(--text-dim);
  }

  .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }

  .status-pill {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 10px;
    background: var(--green-dim);
    border: 1px solid rgba(0,224,150,0.25);
    border-radius: 2px;
    font-family: var(--mono); font-size: 10px;
    color: var(--green); letter-spacing: 0.1em;
  }

  .demo-toggle {
    display: flex; align-items: center; gap: 6px;
    padding: 4px 10px;
    background: var(--surface2);
    border: 1px solid var(--border);
    border-radius: 2px; cursor: pointer;
    font-family: var(--mono); font-size: 10px;
    color: var(--text-dim); letter-spacing: 0.08em;
    transition: all 0.15s;
  }

  .demo-toggle:hover { border-color: var(--border2); color: var(--text); }

  .time-display {
    font-family: var(--mono); font-size: 12px;
    color: var(--text-dim); letter-spacing: 0.1em;
  }

  /* Content */
  .content { padding: 24px; }

  /* Section label */
  .section-label {
    font-family: var(--mono); font-size: 10px;
    color: var(--text-dim); letter-spacing: 0.25em;
    text-transform: uppercase; margin-bottom: 12px;
    display: flex; align-items: center; gap: 8px;
  }

  .section-label::after {
    content: ''; flex: 1; height: 1px; background: var(--border);
  }

  /* Metric cards */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px; margin-bottom: 24px;
  }

  .metric-card {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 16px 18px;
    position: relative; overflow: hidden;
    transition: border-color 0.2s;
  }

  .metric-card:hover { border-color: var(--border2); }

  .metric-card.accent-cyan  { border-top: 2px solid var(--cyan); }
  .metric-card.accent-amber { border-top: 2px solid var(--amber); }
  .metric-card.accent-green { border-top: 2px solid var(--green); }
  .metric-card.accent-red   { border-top: 2px solid var(--red); }

  .metric-label {
    font-family: var(--mono); font-size: 9px;
    color: var(--text-dim); letter-spacing: 0.2em;
    text-transform: uppercase; margin-bottom: 8px;
  }

  .metric-value {
    font-family: var(--mono); font-size: 32px;
    color: var(--text); line-height: 1;
    margin-bottom: 6px;
  }

  .metric-value.cyan  { color: var(--cyan); }
  .metric-value.amber { color: var(--amber); }
  .metric-value.green { color: var(--green); }
  .metric-value.red   { color: var(--red); }

  .metric-sub {
    font-family: var(--mono); font-size: 10px;
    color: var(--text-dim);
  }

  .metric-sub em { color: var(--text); font-style: normal; }

  .metric-corner {
    position: absolute; top: 12px; right: 14px;
    font-family: var(--mono); font-size: 9px;
    color: var(--text-faint); letter-spacing: 0.1em;
  }

  /* Progress bar */
  .progress-bar {
    height: 2px; background: var(--border);
    margin-top: 10px; overflow: hidden;
  }

  .progress-fill {
    height: 100%; transition: width 0.6s ease;
  }

  .progress-fill.cyan  { background: var(--cyan); box-shadow: 0 0 8px var(--cyan); }
  .progress-fill.amber { background: var(--amber); }
  .progress-fill.green { background: var(--green); }

  /* Main grid */
  .main-grid {
    display: grid;
    grid-template-columns: 1fr 340px;
    gap: 16px;
    margin-bottom: 24px;
  }

  /* Panel */
  .panel {
    background: var(--surface);
    border: 1px solid var(--border);
  }

  .panel-header {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border);
    display: flex; align-items: center; gap: 8px;
  }

  .panel-title {
    font-family: var(--condensed); font-weight: 700;
    font-size: 13px; letter-spacing: 0.12em;
    text-transform: uppercase; color: var(--text);
    flex: 1;
  }

  .panel-action {
    font-family: var(--mono); font-size: 10px;
    color: var(--cyan); letter-spacing: 0.1em;
    cursor: pointer; text-transform: uppercase;
    background: none; border: none;
    transition: opacity 0.15s;
  }

  .panel-action:hover { opacity: 0.7; }

  .live-dot {
    width: 6px; height: 6px; border-radius: 50%;
    background: var(--red);
    box-shadow: 0 0 6px var(--red);
    animation: pulse 1s infinite;
  }

  /* Activity feed */
  .activity-list { padding: 0; }

  .activity-item {
    display: flex; gap: 12px;
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
    transition: background 0.15s;
  }

  .activity-item:last-child { border-bottom: none; }
  .activity-item:hover { background: rgba(255,255,255,0.02); }

  .activity-time {
    font-family: var(--mono); font-size: 10px;
    color: var(--text-faint); min-width: 52px;
    padding-top: 1px;
  }

  .activity-icon {
    width: 18px; height: 18px;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0; margin-top: 1px;
    font-size: 12px;
  }

  .activity-body { flex: 1; min-width: 0; }

  .activity-agent {
    font-family: var(--mono); font-size: 10px;
    color: var(--cyan); margin-right: 6px;
    letter-spacing: 0.06em;
  }

  .activity-msg {
    font-family: var(--body); font-size: 12px;
    color: var(--text); line-height: 1.4;
  }

  .activity-tag {
    display: inline-block;
    font-family: var(--mono); font-size: 9px;
    padding: 1px 5px; border-radius: 2px;
    margin-left: 6px; vertical-align: middle;
    letter-spacing: 0.06em;
  }

  .tag-done    { background: var(--green-dim); color: var(--green); border: 1px solid rgba(0,224,150,0.2); }
  .tag-created { background: var(--cyan-glow); color: var(--cyan); border: 1px solid rgba(0,212,255,0.2); }
  .tag-error   { background: var(--red-dim); color: var(--red); border: 1px solid rgba(255,69,96,0.2); }
  .tag-cron    { background: var(--amber-dim); color: var(--amber); border: 1px solid rgba(255,176,32,0.2); }

  /* Sessions panel */
  .session-item {
    padding: 10px 16px;
    border-bottom: 1px solid var(--border);
  }

  .session-item:last-child { border-bottom: none; }

  .session-header {
    display: flex; align-items: center; gap: 6px; margin-bottom: 6px;
  }

  .session-agent {
    font-family: var(--mono); font-size: 11px; color: var(--cyan);
    letter-spacing: 0.08em;
  }

  .session-model {
    font-family: var(--mono); font-size: 9px; color: var(--text-faint);
    margin-left: auto; letter-spacing: 0.06em;
  }

  .session-metrics {
    display: grid; grid-template-columns: 1fr 1fr 1fr;
    gap: 4px;
  }

  .session-metric-box {
    background: var(--surface2);
    padding: 4px 6px;
  }

  .smb-label {
    font-family: var(--mono); font-size: 8px;
    color: var(--text-faint); letter-spacing: 0.15em;
    text-transform: uppercase;
  }

  .smb-value {
    font-family: var(--mono); font-size: 12px; color: var(--text);
  }

  /* Crons panel */
  .cron-item {
    display: flex; align-items: center; gap: 10px;
    padding: 9px 16px;
    border-bottom: 1px solid var(--border);
  }

  .cron-item:last-child { border-bottom: none; }

  .cron-name {
    font-family: var(--condensed); font-size: 13px;
    font-weight: 600; color: var(--text); flex: 1;
    letter-spacing: 0.04em;
  }

  .cron-agent {
    font-family: var(--mono); font-size: 9px;
    color: var(--text-dim); letter-spacing: 0.06em;
  }

  .cron-time {
    font-family: var(--mono); font-size: 10px;
    color: var(--amber); letter-spacing: 0.06em; min-width: 56px;
    text-align: right;
  }

  /* Kanban mini preview */
  .kanban-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
  }

  .kanban-col-header {
    display: flex; align-items: center; justify-content: space-between;
    margin-bottom: 8px;
  }

  .kanban-col-name {
    font-family: var(--condensed); font-weight: 700;
    font-size: 11px; letter-spacing: 0.14em;
    text-transform: uppercase; color: var(--text-dim);
  }

  .kanban-count {
    font-family: var(--mono); font-size: 10px;
    color: var(--text-faint);
    background: var(--surface2);
    padding: 1px 6px; border-radius: 2px;
  }

  .kanban-task {
    background: var(--surface2);
    border: 1px solid var(--border);
    border-left: 2px solid transparent;
    padding: 8px 10px; margin-bottom: 6px;
    cursor: pointer;
    transition: border-color 0.15s, transform 0.1s;
  }

  .kanban-task:hover {
    border-color: var(--border2);
    border-left-color: var(--cyan);
    transform: translateX(2px);
  }

  .kanban-task.priority-high   { border-left-color: var(--red); }
  .kanban-task.priority-medium { border-left-color: var(--amber); }
  .kanban-task.priority-low    { border-left-color: var(--text-faint); }

  .task-title {
    font-family: var(--body); font-size: 12px;
    color: var(--text); line-height: 1.3; margin-bottom: 6px;
  }

  .task-meta {
    display: flex; align-items: center; gap: 6px;
  }

  .task-agent-tag {
    font-family: var(--mono); font-size: 9px;
    color: var(--cyan); letter-spacing: 0.06em;
  }

  .task-due {
    font-family: var(--mono); font-size: 9px;
    color: var(--text-faint); margin-left: auto;
  }

  .task-due.overdue { color: var(--red); }

  /* Cost bar */
  .cost-bar-container { padding: 14px 16px; }

  .cost-bar-labels {
    display: flex; justify-content: space-between;
    margin-bottom: 6px;
  }

  .cost-bar-label {
    font-family: var(--mono); font-size: 10px; color: var(--text-dim);
  }

  .cost-bar-value {
    font-family: var(--mono); font-size: 10px; color: var(--amber);
  }

  .cost-bar-track {
    height: 4px; background: var(--surface3);
    position: relative; overflow: hidden;
  }

  .cost-bar-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--cyan), var(--amber));
    transition: width 0.6s ease;
  }

  /* Divider */
  .divider {
    height: 1px; background: var(--border);
    margin: 0 16px;
  }

  /* Scrollable */
  .scrollable { overflow-y: auto; max-height: 380px; }
  .scrollable::-webkit-scrollbar { width: 3px; }
  .scrollable::-webkit-scrollbar-track { background: transparent; }
  .scrollable::-webkit-scrollbar-thumb { background: var(--border2); }
`;

const AGENTS = [
  { id: "tars", name: "TARS", role: "Chief of Staff", status: "running" },
  { id: "case", name: "CASE", role: "Tech Lead / Flip", status: "online" },
  { id: "kipp", name: "KIPP", role: "Tech Lead / Foco", status: "offline" },
  { id: "plex", name: "PLEX", role: "Software Eng.", status: "running" },
  { id: "echo", name: "ECHO", role: "Social Media", status: "online" },
];

const ACTIVITY = [
  { time: "15:42", agent: "PLEX", msg: "Criou a tarefa", tag: "CREATED", tagType: "created", detail: "Implementar auth JWT no Meu Foco" },
  { time: "15:38", agent: "TARS", msg: "Cron executado com sucesso", tag: "CRON", tagType: "cron", detail: "Daily Standup Summary" },
  { time: "15:31", agent: "CASE", msg: "Moveu tarefa para Review", tag: "DONE", tagType: "done", detail: "Setup CI/CD pipeline" },
  { time: "15:20", agent: "ECHO", msg: "Publicou rascunho de roteiro", tag: "CREATED", tagType: "created", detail: "Vídeo: Automação com IA em 2026" },
  { time: "15:14", agent: "PLEX", msg: "Erro ao executar migration", tag: "ERROR", tagType: "error", detail: "column 'tags' already exists" },
  { time: "14:58", agent: "KIPP", msg: "Sessão encerrada", tag: "CRON", tagType: "cron", detail: "claude-sonnet-4-6 · 8.2k tokens" },
  { time: "14:45", agent: "TARS", msg: "Concluiu tarefa", tag: "DONE", tagType: "done", detail: "Revisar PRD v2" },
  { time: "14:30", agent: "ECHO", msg: "Criou thumbnail", tag: "CREATED", tagType: "created", detail: "Midjourney v6 prompt executado" },
];

const SESSIONS = [
  { agent: "TARS", model: "claude-opus-4-6", inputTokens: "24.1k", outputTokens: "6.8k", cost: "$0.62", duration: "1h 12m" },
  { agent: "PLEX", model: "claude-sonnet-4-6", inputTokens: "11.4k", outputTokens: "3.2k", cost: "$0.08", duration: "28m" },
];

const CRONS = [
  { name: "Daily Standup Summary", agent: "TARS", time: "09:00" },
  { name: "Sync GitHub Issues", agent: "PLEX", time: "10:00" },
  { name: "YouTube Analytics", agent: "ECHO", time: "12:00" },
  { name: "Weekly Cost Report", agent: "TARS", time: "18:00" },
];

const KANBAN = {
  "Backlog": [
    { title: "Implement Discord bot integration", agent: "PLEX", priority: "medium", due: "Mar 3" },
    { title: "SOUL.md para ECHO", agent: "TARS", priority: "low", due: "Mar 5" },
  ],
  "In Progress": [
    { title: "Auth JWT no Meu Foco", agent: "PLEX", priority: "high", due: "Feb 26" },
    { title: "Roteiro vídeo #03", agent: "ECHO", priority: "medium", due: "Feb 28" },
    { title: "Setup CI/CD Flip", agent: "CASE", priority: "high", due: "Feb 25", overdue: true },
  ],
  "Review": [
    { title: "PRD Mission Control v2", agent: "TARS", priority: "medium", due: "Feb 24" },
    { title: "Arquitetura Go backend", agent: "PLEX", priority: "high", due: "Feb 24" },
  ],
  "Done": [
    { title: "Kanban schema migration", agent: "PLEX", priority: "low", due: "Feb 23" },
    { title: "Agentes onboarding doc", agent: "TARS", priority: "medium", due: "Feb 22" },
    { title: "Thumbnail template ECHO", agent: "ECHO", priority: "low", due: "Feb 21" },
  ],
};

const NAV = [
  { icon: "⬡", label: "Dashboard", badge: null, active: true },
  { icon: "▦", label: "Tarefas", badge: null },
  { icon: "◈", label: "Agentes", badge: null },
  { icon: "◷", label: "Agenda", badge: null },
  { icon: "◉", label: "Observabilidade", badge: 2 },
  { icon: "⋮", label: "Configurações", badge: null },
];

export default function MissionControl() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [demo, setDemo] = useState(false);

  const now = new Date();
  const timeStr = now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <>
      <style>{FONTS}</style>
      <style>{CSS}</style>
      <div className="scanlines" />

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-mark">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5" />
              <line x1="12" y1="2" x2="12" y2="22" />
              <line x1="2" y1="8.5" x2="22" y2="8.5" />
              <line x1="2" y1="15.5" x2="22" y2="15.5" />
            </svg>
          </div>
          <div>
            <div className="logo-text">Mission Control</div>
            <div className="logo-sub">OpenClaw v1.1</div>
          </div>
        </div>

        <nav className="nav-section">
          <div className="nav-label">Navigation</div>
          {NAV.map((item) => (
            <button
              key={item.label}
              className={`nav-item ${activeNav === item.label ? "active" : ""}`}
              onClick={() => setActiveNav(item.label)}
            >
              <span style={{ fontSize: 14, width: 18, textAlign: "center", opacity: activeNav === item.label ? 1 : 0.5 }}>{item.icon}</span>
              {item.label}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="nav-label" style={{ marginBottom: 8 }}>Agents</div>
          {AGENTS.map((a) => (
            <div key={a.id} className="agent-status-row">
              <div className={`agent-dot ${a.status === "running" ? "dot-running" : a.status === "online" ? "dot-online" : "dot-offline"}`} />
              <div className="agent-name">{a.name}</div>
              <div className="agent-role">{a.status.toUpperCase()}</div>
            </div>
          ))}
        </div>
      </aside>

      {/* Main */}
      <main className="main">
        {/* Topbar */}
        <header className="topbar">
          <div>
            <div className="topbar-title">Dashboard</div>
          </div>
          <div className="topbar-breadcrumb">TUE 24 FEB 2026</div>
          <div className="topbar-right">
            <div className="status-pill">
              <div className="live-dot" style={{ background: "var(--green)", boxShadow: "0 0 6px var(--green)" }} />
              ALL SYSTEMS NOMINAL
            </div>
            <button className="demo-toggle" onClick={() => setDemo(!demo)}>
              {demo ? "◉ DEMO ON" : "○ DEMO OFF"}
            </button>
            <div className="time-display">{timeStr}</div>
          </div>
        </header>

        <div className="content">
          {/* Metrics */}
          <div className="section-label">System Status</div>
          <div className="metrics-grid">
            <div className="metric-card accent-cyan">
              <div className="metric-corner">TASKS</div>
              <div className="metric-label">Total Ativas</div>
              <div className="metric-value cyan">24</div>
              <div className="metric-sub"><em>3</em> em atraso</div>
              <div className="progress-bar"><div className="progress-fill cyan" style={{ width: "68%" }} /></div>
            </div>

            <div className="metric-card accent-amber">
              <div className="metric-corner">WEEKLY</div>
              <div className="metric-label">Em Progresso</div>
              <div className="metric-value">8</div>
              <div className="metric-sub"><em>5</em> concluídas esta semana</div>
              <div className="progress-bar"><div className="progress-fill amber" style={{ width: "40%" }} /></div>
            </div>

            <div className="metric-card accent-green">
              <div className="metric-corner">SESSIONS</div>
              <div className="metric-label">Sessões Ativas</div>
              <div className="metric-value green">2</div>
              <div className="metric-sub">TARS · PLEX</div>
              <div className="progress-bar"><div className="progress-fill green" style={{ width: "100%" }} /></div>
            </div>

            <div className="metric-card accent-amber">
              <div className="metric-corner">COST</div>
              <div className="metric-label">Custo Semanal</div>
              <div className="metric-value amber">$4.32</div>
              <div className="metric-sub">de <em>$20.00</em> · 21.6%</div>
              <div className="progress-bar"><div className="progress-fill amber" style={{ width: "22%" }} /></div>
            </div>
          </div>

          {/* Main grid */}
          <div className="main-grid">
            {/* Activity feed */}
            <div className="panel">
              <div className="panel-header">
                <div className="live-dot" />
                <span className="panel-title">Activity Feed</span>
                <button className="panel-action">Ver todos →</button>
              </div>
              <div className="activity-list scrollable">
                {ACTIVITY.map((item, i) => (
                  <div className="activity-item" key={i}>
                    <div className="activity-time">{item.time}</div>
                    <div className="activity-body">
                      <span className="activity-agent">{item.agent}</span>
                      <span className="activity-msg">{item.msg}</span>
                      <span className={`activity-tag tag-${item.tagType}`}>{item.tag}</span>
                      <div style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-dim)", marginTop: 2 }}>
                        {item.detail}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right column */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Sessions */}
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Sessões Ativas</span>
                  <span style={{ fontFamily: "var(--mono)", fontSize: 10, color: "var(--text-faint)" }}>2 ONLINE</span>
                </div>
                {SESSIONS.map((s, i) => (
                  <div className="session-item" key={i}>
                    <div className="session-header">
                      <div className="agent-dot dot-running" />
                      <span className="session-agent">{s.agent}</span>
                      <span className="session-model">{s.model}</span>
                    </div>
                    <div className="session-metrics">
                      <div className="session-metric-box">
                        <div className="smb-label">IN</div>
                        <div className="smb-value">{s.inputTokens}</div>
                      </div>
                      <div className="session-metric-box">
                        <div className="smb-label">OUT</div>
                        <div className="smb-value">{s.outputTokens}</div>
                      </div>
                      <div className="session-metric-box">
                        <div className="smb-label">COST</div>
                        <div className="smb-value" style={{ color: "var(--amber)" }}>{s.cost}</div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="cost-bar-container">
                  <div className="cost-bar-labels">
                    <span className="cost-bar-label">Custo semanal</span>
                    <span className="cost-bar-value">$4.32 / $20.00</span>
                  </div>
                  <div className="cost-bar-track">
                    <div className="cost-bar-fill" style={{ width: "22%" }} />
                  </div>
                </div>
              </div>

              {/* Next Crons */}
              <div className="panel">
                <div className="panel-header">
                  <span className="panel-title">Próximas Execuções</span>
                  <button className="panel-action">Agenda →</button>
                </div>
                {CRONS.map((c, i) => (
                  <div className="cron-item" key={i}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--text-faint)", flexShrink: 0 }} />
                    <div style={{ flex: 1 }}>
                      <div className="cron-name">{c.name}</div>
                      <div className="cron-agent">{c.agent}</div>
                    </div>
                    <div className="cron-time">→ {c.time}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Kanban preview */}
          <div className="section-label">Kanban — Visão Geral</div>
          <div className="panel" style={{ padding: 16 }}>
            <div className="kanban-grid">
              {Object.entries(KANBAN).map(([col, tasks]) => (
                <div key={col}>
                  <div className="kanban-col-header">
                    <span className="kanban-col-name">{col}</span>
                    <span className="kanban-count">{tasks.length}</span>
                  </div>
                  {tasks.map((t, i) => (
                    <div key={i} className={`kanban-task priority-${t.priority}`}>
                      <div className="task-title">{t.title}</div>
                      <div className="task-meta">
                        <span className="task-agent-tag">{t.agent}</span>
                        <span className={`task-due ${t.overdue ? "overdue" : ""}`}>{t.due}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
