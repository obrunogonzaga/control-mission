import { useState } from "react";

const FONTS = `@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Barlow+Condensed:wght@400;600;700&family=Barlow:wght@400;500&display=swap');`;

const CSS = `
* { box-sizing: border-box; margin: 0; padding: 0; }
:root {
  --bg:         #060a0f;
  --surface:    #0b1018;
  --surface2:   #101720;
  --surface3:   #161f2c;
  --border:     #1e2d3d;
  --border2:    #2e4560;
  --cyan:       #00d4ff;
  --cyan-dim:   rgba(0,212,255,0.10);
  --cyan-glow:  rgba(0,212,255,0.18);
  --amber:      #ffb020;
  --amber-dim:  rgba(255,176,32,0.13);
  --red:        #ff4560;
  --red-dim:    rgba(255,69,96,0.13);
  --green:      #00e096;
  --green-dim:  rgba(0,224,150,0.12);
  --purple:     #a78bfa;
  --purple-dim: rgba(167,139,250,0.13);
  --text:       #c8d8e8;
  --text-dim:   #5a7a99;
  --text-faint: #2a4a66;
  --mono:       'Share Tech Mono', monospace;
  --cond:       'Barlow Condensed', sans-serif;
  --body:       'Barlow', sans-serif;
}
body { background: var(--bg); color: var(--text); font-family: var(--body); overflow-x: hidden; }

.scanlines {
  pointer-events: none; position: fixed; inset: 0; z-index: 9999;
  background: repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.025) 2px,rgba(0,0,0,0.025) 4px);
}

/* ── Sidebar ── */
.sidebar {
  width: 220px; min-height: 100vh; background: var(--surface);
  border-right: 1px solid var(--border);
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
  display: flex; align-items: center; gap: 10px; padding: 9px 16px; cursor: pointer;
  font-family: var(--cond); font-size: 14px; font-weight: 600;
  letter-spacing: .06em; color: var(--text-dim); text-transform: uppercase;
  position: relative; transition: color .15s; border: none; background: none; width: 100%;
}
.nav-item:hover { color: var(--text); background: rgba(255,255,255,.03); }
.nav-item.active { color: var(--cyan); background: var(--cyan-dim); }
.nav-item.active::before { content:''; position:absolute; left:0; top:0; bottom:0; width:2px; background:var(--cyan); box-shadow:0 0 8px var(--cyan); }
.nav-icon { font-size: 13px; width: 18px; text-align: center; opacity: .55; }
.nav-item.active .nav-icon { opacity: 1; }
.sidebar-footer { margin-top: auto; padding: 12px 16px; border-top: 1px solid var(--border); }
.sf-row { display: flex; align-items: center; gap: 8px; padding: 5px 0; }
.adot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.adot.running { background: var(--cyan);  box-shadow: 0 0 6px var(--cyan);  animation: blink 1.5s infinite; }
.adot.online  { background: var(--green); box-shadow: 0 0 5px var(--green); }
.adot.offline { background: var(--text-faint); }
@keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }
.aname { font-family: var(--mono); font-size: 11px; color: var(--text-dim); flex: 1; }
.arole { font-family: var(--mono); font-size: 9px; color: var(--text-faint); }

/* ── Main ── */
.main { margin-left: 220px; min-height: 100vh; display: flex; flex-direction: column; }

/* ── Topbar ── */
.topbar {
  background: var(--surface); border-bottom: 1px solid var(--border);
  padding: 0 24px; height: 52px; display: flex; align-items: center; gap: 12px;
  position: sticky; top: 0; z-index: 100;
}
.topbar-title { font-family: var(--cond); font-weight: 700; font-size: 18px; letter-spacing: .1em; text-transform: uppercase; }
.topbar-sep   { color: var(--text-faint); font-size: 18px; }
.topbar-sub   { font-family: var(--mono); font-size: 11px; color: var(--text-dim); }
.topbar-right { margin-left: auto; display: flex; align-items: center; gap: 10px; }
.btn {
  display: flex; align-items: center; gap: 6px;
  font-family: var(--mono); font-size: 11px; letter-spacing: .08em;
  padding: 6px 12px; cursor: pointer;
  border: 1px solid var(--border); background: var(--surface2); color: var(--text-dim);
  transition: all .15s; text-transform: uppercase;
}
.btn:hover { border-color: var(--border2); color: var(--text); }
.btn.primary { background: var(--cyan-glow); border-color: var(--cyan); color: var(--cyan); }
.btn.primary:hover { background: rgba(0,212,255,.25); }
.btn.danger  { background: var(--red-dim);  border-color: rgba(255,69,96,.35); color: var(--red); }

/* ── Stats bar ── */
.stats-bar { display: flex; border-bottom: 1px solid var(--border); background: var(--surface); }
.stat-cell { flex: 1; padding: 8px 24px; border-right: 1px solid var(--border); display: flex; align-items: center; gap: 10px; }
.stat-cell:last-child { border-right: none; }
.stat-num { font-family: var(--mono); font-size: 22px; }
.stat-num.cyan   { color: var(--cyan); }
.stat-num.green  { color: var(--green); }
.stat-num.amber  { color: var(--amber); }
.stat-label { font-family: var(--mono); font-size: 9px; color: var(--text-dim); letter-spacing: .15em; text-transform: uppercase; line-height: 1.5; white-space: pre-line; }

/* ── Toolbar ── */
.toolbar {
  background: var(--surface); border-bottom: 1px solid var(--border);
  padding: 10px 24px; display: flex; align-items: center; gap: 10px;
}
.search-box {
  display: flex; align-items: center; gap: 8px;
  background: var(--surface2); border: 1px solid var(--border);
  padding: 6px 10px; min-width: 220px;
}
.search-box input {
  background: none; border: none; outline: none;
  font-family: var(--mono); font-size: 11px; color: var(--text); width: 170px;
}
.search-box input::placeholder { color: var(--text-faint); }
.filter-group { display: flex; gap: 6px; align-items: center; }
.filter-label { font-family: var(--mono); font-size: 9px; color: var(--text-faint); letter-spacing: .15em; }
.filter-chip {
  font-family: var(--mono); font-size: 10px; letter-spacing: .06em;
  padding: 4px 10px; cursor: pointer; text-transform: uppercase;
  border: 1px solid var(--border); background: transparent; color: var(--text-dim);
  transition: all .15s;
}
.filter-chip:hover { border-color: var(--border2); color: var(--text); }
.filter-chip.active { border-color: var(--cyan); color: var(--cyan); background: var(--cyan-dim); }
.filter-chip.green.active  { border-color: var(--green); color: var(--green); background: var(--green-dim); }
.filter-chip.amber.active  { border-color: var(--amber); color: var(--amber); background: var(--amber-dim); }
.toolbar-right { margin-left: auto; display: flex; gap: 6px; }
.view-btn { font-family: var(--mono); font-size: 11px; padding: 5px 9px; border: 1px solid var(--border); background: transparent; color: var(--text-dim); cursor: pointer; }
.view-btn.active { border-color: var(--border2); color: var(--text); background: var(--surface2); }

/* ── Content ── */
.content { padding: 24px; flex: 1; }
.section-label {
  font-family: var(--mono); font-size: 9px; color: var(--text-dim);
  letter-spacing: .25em; text-transform: uppercase; margin-bottom: 14px;
  display: flex; align-items: center; gap: 8px;
}
.section-label::after { content:''; flex:1; height:1px; background: var(--border); }

/* ── Agent Grid ── */
.agent-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 14px; }

/* ── Agent Card ── */
.agent-card {
  background: var(--surface); border: 1px solid var(--border);
  position: relative; overflow: hidden;
  transition: border-color .2s, transform .15s;
  cursor: pointer;
}
.agent-card:hover { border-color: var(--border2); transform: translateY(-2px); }
.agent-card.selected { border-color: var(--cyan); box-shadow: 0 0 0 1px var(--cyan); }
.agent-card.offline { opacity: .6; }

/* glow line top */
.agent-card::before {
  content: ''; position: absolute; top: 0; left: 0; right: 0; height: 2px;
}
.agent-card.status-running::before { background: var(--cyan); box-shadow: 0 0 10px var(--cyan); }
.agent-card.status-online::before  { background: var(--green); }
.agent-card.status-offline::before { background: var(--text-faint); }

/* corner decoration */
.agent-card::after {
  content: ''; position: absolute; top: 0; right: 0;
  border-top: 20px solid var(--surface3); border-left: 20px solid transparent;
}

.card-head {
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--border);
  display: flex; align-items: flex-start; gap: 14px;
}

.agent-avatar {
  width: 48px; height: 48px; flex-shrink: 0;
  background: var(--surface2); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  position: relative;
  clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
}
.avatar-letter {
  font-family: var(--cond); font-weight: 700; font-size: 20px; letter-spacing: .06em;
}
.avatar-ping {
  position: absolute; bottom: -2px; right: -2px;
  width: 10px; height: 10px; border-radius: 50%;
  border: 2px solid var(--surface);
}

.agent-info { flex: 1; min-width: 0; }
.agent-name-row { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
.agent-name {
  font-family: var(--cond); font-weight: 700; font-size: 20px;
  letter-spacing: .1em; text-transform: uppercase;
}
.status-badge {
  font-family: var(--mono); font-size: 9px; letter-spacing: .1em;
  padding: 2px 7px; text-transform: uppercase;
}
.status-badge.running { background: var(--cyan-dim);  border: 1px solid rgba(0,212,255,.3); color: var(--cyan); }
.status-badge.online  { background: var(--green-dim); border: 1px solid rgba(0,224,150,.3); color: var(--green); }
.status-badge.offline { background: rgba(255,255,255,.04); border: 1px solid var(--border); color: var(--text-faint); }

.agent-role {
  font-family: var(--mono); font-size: 11px; color: var(--text-dim); letter-spacing: .06em;
}

.card-stats {
  display: grid; grid-template-columns: 1fr 1fr 1fr;
  border-bottom: 1px solid var(--border);
}
.cstat {
  padding: 8px 14px; border-right: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 3px;
}
.cstat:last-child { border-right: none; }
.cstat-val { font-family: var(--mono); font-size: 18px; color: var(--text); }
.cstat-val.cyan  { color: var(--cyan); }
.cstat-val.amber { color: var(--amber); }
.cstat-val.green { color: var(--green); }
.cstat-lbl { font-family: var(--mono); font-size: 8px; color: var(--text-faint); letter-spacing: .15em; text-transform: uppercase; }

.card-signals {
  padding: 10px 14px; border-bottom: 1px solid var(--border);
  display: grid; grid-template-columns: 1fr 1fr; gap: 10px;
}
.signal-block {}
.signal-label {
  font-family: var(--mono); font-size: 8px; color: var(--text-faint);
  letter-spacing: .2em; text-transform: uppercase; margin-bottom: 4px;
  display: flex; align-items: center; gap: 5px;
}
.signal-arrow { font-size: 10px; }
.signal-arrow.in  { color: var(--green); }
.signal-arrow.out { color: var(--cyan); }
.signal-text {
  font-family: var(--body); font-size: 11px; color: var(--text-dim); line-height: 1.4;
}

.card-last {
  padding: 8px 14px;
  display: flex; align-items: center; gap: 6px;
}
.last-label { font-family: var(--mono); font-size: 9px; color: var(--text-faint); letter-spacing: .1em; }
.last-value { font-family: var(--mono); font-size: 9px; color: var(--text-dim); flex: 1; }
.last-activity {
  font-family: var(--mono); font-size: 9px; color: var(--text-dim);
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1;
}

.card-actions {
  padding: 10px 14px; border-top: 1px solid var(--border);
  display: flex; gap: 6px;
}

/* ── Detail Panel ── */
.detail-overlay {
  position: fixed; inset: 0; z-index: 300;
  background: rgba(0,0,0,.65); backdrop-filter: blur(3px);
  display: flex; justify-content: flex-end;
  animation: fadeIn .15s ease;
}
@keyframes fadeIn { from{opacity:0} to{opacity:1} }
.detail-panel {
  width: 480px; height: 100vh; background: var(--surface);
  border-left: 1px solid var(--border); overflow-y: auto;
  animation: slideIn .18s ease; display: flex; flex-direction: column;
}
@keyframes slideIn { from{transform:translateX(24px);opacity:0} to{transform:none;opacity:1} }
.detail-panel::-webkit-scrollbar { width: 3px; }
.detail-panel::-webkit-scrollbar-thumb { background: var(--border2); }

.dp-header {
  padding: 0 20px; height: 52px;
  display: flex; align-items: center; gap: 12px;
  border-bottom: 1px solid var(--border);
  position: sticky; top: 0; background: var(--surface); z-index: 10;
}
.dp-header-name {
  font-family: var(--cond); font-weight: 700; font-size: 18px;
  letter-spacing: .1em; text-transform: uppercase;
}
.dp-close {
  margin-left: auto; background: none; border: none;
  color: var(--text-dim); cursor: pointer; font-family: var(--mono);
  font-size: 20px; line-height: 1; padding: 2px 6px; transition: color .15s;
}
.dp-close:hover { color: var(--text); }

.dp-hero {
  padding: 24px; border-bottom: 1px solid var(--border);
  display: flex; gap: 18px; align-items: center;
}
.dp-avatar {
  width: 72px; height: 72px; flex-shrink: 0;
  background: var(--surface2); border: 1px solid var(--border);
  display: flex; align-items: center; justify-content: center;
  clip-path: polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%);
  position: relative;
}
.dp-avatar-letter { font-family: var(--cond); font-weight: 700; font-size: 30px; letter-spacing: .06em; }

.dp-agent-info {}
.dp-name { font-family: var(--cond); font-weight: 700; font-size: 28px; letter-spacing: .1em; }
.dp-role { font-family: var(--mono); font-size: 12px; color: var(--text-dim); letter-spacing: .08em; margin: 2px 0 8px; }

.dp-body { padding: 20px; flex: 1; }

.dp-section-label {
  font-family: var(--mono); font-size: 9px; color: var(--text-dim);
  letter-spacing: .25em; text-transform: uppercase;
  margin: 20px 0 10px; display: flex; align-items: center; gap: 8px;
}
.dp-section-label::after { content:''; flex:1; height:1px; background: var(--border); }
.dp-section-label:first-child { margin-top: 0; }

.dp-description {
  font-family: var(--body); font-size: 13px; color: var(--text-dim);
  line-height: 1.65; padding: 12px 14px;
  background: var(--surface2); border: 1px solid var(--border);
}

.dp-signal-block {
  background: var(--surface2); border: 1px solid var(--border);
  padding: 10px 14px; margin-bottom: 8px;
}
.dp-signal-label {
  font-family: var(--mono); font-size: 9px; color: var(--text-faint);
  letter-spacing: .15em; text-transform: uppercase; margin-bottom: 5px;
  display: flex; align-items: center; gap: 6px;
}
.dp-signal-text {
  font-family: var(--body); font-size: 12px; color: var(--text); line-height: 1.5;
}

/* stats grid */
.dp-stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
.dp-stat {
  background: var(--surface2); border: 1px solid var(--border);
  padding: 10px 12px;
}
.dp-stat-val { font-family: var(--mono); font-size: 22px; }
.dp-stat-lbl { font-family: var(--mono); font-size: 9px; color: var(--text-faint); letter-spacing: .12em; text-transform: uppercase; }

/* tasks list */
.dp-task-row {
  display: flex; align-items: center; gap: 10px;
  padding: 8px 0; border-bottom: 1px solid var(--border);
}
.dp-task-row:last-child { border: none; }
.dp-task-prio { width: 3px; height: 28px; border-radius: 1px; flex-shrink: 0; }
.dp-task-title { font-family: var(--body); font-size: 12px; color: var(--text); flex: 1; }
.dp-task-col {
  font-family: var(--mono); font-size: 9px; letter-spacing: .06em;
  padding: 2px 7px; border-radius: 2px;
}

/* command box */
.command-box {
  background: var(--surface2); border: 1px solid var(--border);
  padding: 10px 12px;
}
.command-box textarea {
  background: none; border: none; outline: none; resize: none;
  font-family: var(--mono); font-size: 12px; color: var(--text);
  width: 100%; min-height: 72px; line-height: 1.5;
}
.command-box textarea::placeholder { color: var(--text-faint); }
.command-footer {
  display: flex; align-items: center; justify-content: space-between; margin-top: 8px;
}
.command-hint { font-family: var(--mono); font-size: 9px; color: var(--text-faint); letter-spacing: .08em; }

.dp-footer {
  padding: 14px 20px; border-top: 1px solid var(--border);
  display: flex; gap: 8px; position: sticky; bottom: 0; background: var(--surface);
}

/* ── Activity list in detail ── */
.dp-activity-item {
  display: flex; gap: 10px; padding: 8px 0;
  border-bottom: 1px solid var(--border);
}
.dp-activity-item:last-child { border: none; }
.dp-act-time { font-family: var(--mono); font-size: 9px; color: var(--text-faint); min-width: 52px; padding-top: 1px; }
.dp-act-tag {
  font-family: var(--mono); font-size: 9px; padding: 1px 5px;
  letter-spacing: .04em;
}
.dp-act-tag.done    { color: var(--green); background: var(--green-dim); border: 1px solid rgba(0,224,150,.2); }
.dp-act-tag.created { color: var(--cyan);  background: var(--cyan-dim);  border: 1px solid rgba(0,212,255,.2); }
.dp-act-tag.error   { color: var(--red);   background: var(--red-dim);   border: 1px solid rgba(255,69,96,.2); }
.dp-act-tag.cron    { color: var(--amber); background: var(--amber-dim); border: 1px solid rgba(255,176,32,.2); }
.dp-act-body { font-family: var(--body); font-size: 12px; color: var(--text-dim); line-height: 1.4; flex: 1; }
`;

// ─── Data ───────────────────────────────────────────────────────────────────

const AGENTS = [
  {
    id: "tars", name: "TARS", role: "Chief of Staff",
    status: "running",
    color: "#00d4ff",
    description: "Agente de orquestração geral. Responsável por priorizar tarefas, manter o contexto de projetos, convocar outros agentes e garantir que o Bruno não perca prazos. Lê o dashboard a cada hora e envia resumos diários.",
    input: "Objetivo ou pergunta em linguagem natural, lista de tarefas, contexto de reunião",
    output: "Plano de ação priorizado, resumo executivo, delegação de tarefas a outros agentes",
    tasks_active: 3, tasks_done: 18, cost_week: "$1.24",
    last_seen: "há 2 min",
    last_activity: "Cron 'Daily Standup Summary' executado",
    activity: [
      { time: "15:38", tag: "cron",    tagType: "cron",    text: "Executou Daily Standup Summary" },
      { time: "14:45", tag: "done",    tagType: "done",    text: "Concluiu revisão do PRD v2" },
      { time: "10:00", tag: "cron",    tagType: "cron",    text: "Executou Weekly Cost Report" },
      { time: "Feb 23", tag: "created", tagType: "created", text: "Criou tarefa 'SOUL.md para ECHO'" },
    ],
    tasks: [
      { title: "Revisar arquitetura técnica", col: "In Progress", priority: "#ffb020" },
      { title: "SOUL.md para ECHO",           col: "Backlog",     priority: "#5a7a99" },
      { title: "Weekly digest de tarefas",    col: "Backlog",     priority: "#ffb020" },
    ],
  },
  {
    id: "case", name: "CASE", role: "Tech Lead — Meu Flip",
    status: "online",
    color: "#00e096",
    description: "Tech lead exclusivo do projeto Meu Flip. Responsável por decisões de arquitetura, code review, gestão de PRs e acompanhamento do CI/CD. Tem acesso ao repositório GitHub do Flip.",
    input: "Descrição de feature, PR link, erro de build, decisão de arquitetura",
    output: "Code review comentado, decisão documentada, tarefa criada, PR aprovado",
    tasks_active: 2, tasks_done: 11, cost_week: "$0.38",
    last_seen: "há 14 min",
    last_activity: "Moveu 'Setup CI/CD pipeline' para Review",
    activity: [
      { time: "15:31", tag: "done",    tagType: "done",    text: "Moveu 'Setup CI/CD pipeline' para Review" },
      { time: "13:20", tag: "created", tagType: "created", text: "Abriu PR #42 no repositório Flip" },
      { time: "Feb 23", tag: "done",   tagType: "done",    text: "Aprovou merge da feature de onboarding" },
    ],
    tasks: [
      { title: "Setup CI/CD pipeline Meu Flip", col: "Review",      priority: "#ff4560" },
      { title: "Revisão do schema de usuários",  col: "In Progress", priority: "#ffb020" },
    ],
  },
  {
    id: "kipp", name: "KIPP", role: "Tech Lead — Meu Foco",
    status: "offline",
    color: "#5a7a99",
    description: "Tech lead do projeto Meu Foco. Focado em performance, UX técnica e integração com APIs externas. Atualmente em standby aguardando início do ciclo de desenvolvimento Q2.",
    input: "Requisito de feature, bug report, métrica de performance",
    output: "Análise técnica, proposta de implementação, estimativa de esforço",
    tasks_active: 0, tasks_done: 7, cost_week: "$0.00",
    last_seen: "há 2 dias",
    last_activity: "Sessão encerrada — 8.2k tokens",
    activity: [
      { time: "Feb 22", tag: "cron",  tagType: "cron", text: "Sessão encerrada (8.2k tokens)" },
      { time: "Feb 20", tag: "done",  tagType: "done", text: "Concluiu análise de performance da API" },
    ],
    tasks: [],
  },
  {
    id: "plex", name: "PLEX", role: "Software Engineer",
    status: "running",
    color: "#00d4ff",
    description: "Engenheiro de software generalista. Trabalha em qualquer projeto quando CASE e KIPP estão ocupados ou quando a tarefa não pertence a um projeto específico. Especializado em back-end Go e integrações de API.",
    input: "Tarefa de implementação, spec de endpoint, bug report com logs",
    output: "Código implementado, PR aberto, tarefa atualizada no Mission Control",
    tasks_active: 4, tasks_done: 23, cost_week: "$0.82",
    last_seen: "há 1 min",
    last_activity: "Criou tarefa 'Implementar auth JWT'",
    activity: [
      { time: "15:42", tag: "created", tagType: "created", text: "Criou tarefa 'Implementar auth JWT no Meu Foco'" },
      { time: "15:14", tag: "error",   tagType: "error",   text: "Erro ao executar migration — column 'tags' already exists" },
      { time: "14:30", tag: "done",    tagType: "done",    text: "Concluiu Kanban schema migration" },
      { time: "Feb 23", tag: "done",   tagType: "done",    text: "Finalizou estrutura de pastas Go" },
    ],
    tasks: [
      { title: "Auth JWT no Meu Foco",           col: "In Progress", priority: "#ff4560" },
      { title: "Integrar Discord bot",            col: "Backlog",     priority: "#ffb020" },
      { title: "Arquitetura Go backend",          col: "Review",      priority: "#ff4560" },
      { title: "Dashboard de métricas YouTube",   col: "Backlog",     priority: "#ffb020" },
    ],
  },
  {
    id: "echo", name: "ECHO", role: "Social Media Manager",
    status: "online",
    color: "#00e096",
    description: "Gerente de presença digital. Responsável pelo canal do YouTube, roteiros, thumbnails, publicação e análise de performance. Coordena o pipeline de conteúdo do início ao fim.",
    input: "Tema de vídeo, rascunho de roteiro, dados de analytics, referências visuais",
    output: "Roteiro finalizado, thumbnail gerada, post agendado, relatório de performance",
    tasks_active: 2, tasks_done: 9, cost_week: "$0.64",
    last_seen: "há 8 min",
    last_activity: "Publicou rascunho do roteiro Vídeo #03",
    activity: [
      { time: "15:20", tag: "created", tagType: "created", text: "Publicou rascunho de roteiro — Vídeo #03" },
      { time: "14:30", tag: "done",    tagType: "done",    text: "Gerou thumbnail template com Midjourney v6" },
      { time: "Feb 23", tag: "created", tagType: "created", text: "Iniciou roteiro do Vídeo #02" },
    ],
    tasks: [
      { title: "Roteiro — Vídeo #03: IA no trabalho", col: "In Progress", priority: "#ffb020" },
      { title: "Dashboard de métricas YouTube",       col: "Backlog",     priority: "#ffb020" },
    ],
  },
];

const NAV = [
  { icon: "⬡", label: "Dashboard" },
  { icon: "▦", label: "Tarefas" },
  { icon: "◈", label: "Agentes", active: true },
  { icon: "◷", label: "Agenda" },
  { icon: "◉", label: "Observabilidade", badge: 2 },
  { icon: "⋮", label: "Configurações" },
];

// ─── Component ──────────────────────────────────────────────────────────────

export default function AgentsPage() {
  const [selected, setSelected]     = useState(null);
  const [search, setSearch]         = useState("");
  const [filterStatus, setFilterStatus] = useState(null);
  const [command, setCommand]       = useState("");
  const [cmdSent, setCmdSent]       = useState(false);

  const selectedAgent = AGENTS.find(a => a.id === selected);

  const visible = AGENTS.filter(a => {
    const matchSearch = !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.role.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const running = AGENTS.filter(a => a.status === "running").length;
  const online  = AGENTS.filter(a => a.status === "online").length;
  const offline = AGENTS.filter(a => a.status === "offline").length;
  const totalActive = AGENTS.filter(a => a.status !== "offline").reduce((s, a) => s + a.tasks_active, 0);

  function sendCommand() {
    if (!command.trim()) return;
    setCmdSent(true);
    setTimeout(() => { setCmdSent(false); setCommand(""); }, 2000);
  }

  const avatarColor = (agent) => ({
    "tars": "var(--cyan)",
    "case": "var(--green)",
    "kipp": "var(--text-dim)",
    "plex": "var(--cyan)",
    "echo": "var(--green)",
  })[agent.id] || "var(--text-dim)";

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
              {n.badge && <span style={{ marginLeft:"auto", background:"var(--red)", color:"#fff", fontFamily:"var(--mono)", fontSize:10, padding:"1px 5px", borderRadius:2 }}>{n.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="nav-label" style={{ marginBottom: 8 }}>Agents</div>
          {AGENTS.map(a => (
            <div key={a.id} className="sf-row">
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
          <div className="topbar-title">Agentes</div>
          <span className="topbar-sep">/</span>
          <span className="topbar-sub">Team Overview</span>
          <div className="topbar-right">
            <button className="btn primary">+ Novo Agente</button>
          </div>
        </header>

        {/* Stats */}
        <div className="stats-bar">
          {[
            { label: "Em\nExecução",   value: running,     cls: "cyan" },
            { label: "Online\n",       value: online,      cls: "green" },
            { label: "Offline\n",      value: offline,     cls: "amber" },
            { label: "Tarefas\nAtivas",value: totalActive, cls: "cyan" },
          ].map(s => (
            <div key={s.label} className="stat-cell">
              <div className={`stat-num ${s.cls}`}>{s.value}</div>
              <div className="stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="toolbar">
          <div className="search-box">
            <span style={{ color:"var(--text-faint)", fontSize:12 }}>⌕</span>
            <input placeholder="Buscar agentes..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="filter-group">
            <span className="filter-label">Status</span>
            {[["running",""], ["online","green"], ["offline","amber"]].map(([s, c]) => (
              <button key={s} className={`filter-chip ${c} ${filterStatus === s ? "active" : ""}`}
                onClick={() => setFilterStatus(filterStatus === s ? null : s)}>
                {s}
              </button>
            ))}
          </div>
          <div className="toolbar-right">
            <button className="view-btn active">⊞ Grid</button>
            <button className="view-btn">≡ List</button>
          </div>
        </div>

        {/* Content */}
        <div className="content">
          <div className="section-label">Squad — {visible.length} agente{visible.length !== 1 ? "s" : ""}</div>
          <div className="agent-grid">
            {visible.map(agent => (
              <div
                key={agent.id}
                className={`agent-card status-${agent.status} ${selected === agent.id ? "selected" : ""} ${agent.status === "offline" ? "offline" : ""}`}
                onClick={() => setSelected(selected === agent.id ? null : agent.id)}
              >
                {/* Header */}
                <div className="card-head">
                  <div className="agent-avatar" style={{ borderColor: agent.status === "offline" ? "var(--border)" : agent.color }}>
                    <span className="avatar-letter" style={{ color: avatarColor(agent) }}>{agent.name[0]}</span>
                    <div
                      className="avatar-ping"
                      style={{
                        background: agent.status === "running" ? "var(--cyan)" : agent.status === "online" ? "var(--green)" : "var(--text-faint)",
                      }}
                    />
                  </div>
                  <div className="agent-info">
                    <div className="agent-name-row">
                      <span className="agent-name">{agent.name}</span>
                      <span className={`status-badge ${agent.status}`}>{agent.status}</span>
                    </div>
                    <div className="agent-role">{agent.role}</div>
                  </div>
                </div>

                {/* Stats */}
                <div className="card-stats">
                  <div className="cstat">
                    <div className={`cstat-val ${agent.tasks_active > 0 ? "cyan" : ""}`}>{agent.tasks_active}</div>
                    <div className="cstat-lbl">Tarefas\nAtivas</div>
                  </div>
                  <div className="cstat">
                    <div className="cstat-val green">{agent.tasks_done}</div>
                    <div className="cstat-lbl">Concluídas\nTotal</div>
                  </div>
                  <div className="cstat">
                    <div className={`cstat-val ${agent.cost_week !== "$0.00" ? "amber" : ""}`}>{agent.cost_week}</div>
                    <div className="cstat-lbl">Custo\nSemanal</div>
                  </div>
                </div>

                {/* Signals */}
                <div className="card-signals">
                  <div className="signal-block">
                    <div className="signal-label"><span className="signal-arrow in">↘</span> Input</div>
                    <div className="signal-text">{agent.input.split(",")[0].trim()}{agent.input.split(",").length > 1 ? "…" : ""}</div>
                  </div>
                  <div className="signal-block">
                    <div className="signal-label"><span className="signal-arrow out">↗</span> Output</div>
                    <div className="signal-text">{agent.output.split(",")[0].trim()}{agent.output.split(",").length > 1 ? "…" : ""}</div>
                  </div>
                </div>

                {/* Last activity */}
                <div className="card-last">
                  <span className="last-label">LAST —</span>
                  <span className="last-activity">{agent.last_activity}</span>
                  <span style={{ fontFamily:"var(--mono)", fontSize:9, color:"var(--text-faint)", flexShrink:0 }}>{agent.last_seen}</span>
                </div>

                {/* Actions */}
                <div className="card-actions" onClick={e => e.stopPropagation()}>
                  <button className="btn primary" style={{ flex:1 }}
                    onClick={() => { setSelected(agent.id); }}>
                    ✎ Comando
                  </button>
                  <button className="btn" onClick={() => setSelected(agent.id)}>
                    ◉ Detalhe
                  </button>
                  {agent.status !== "offline" && (
                    <button className="btn" style={{ color:"var(--amber)", borderColor:"rgba(255,176,32,.3)", background:"var(--amber-dim)" }}>
                      ⏸
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Detail Panel */}
      {selectedAgent && (
        <div className="detail-overlay" onClick={e => { if (e.target === e.currentTarget) setSelected(null); }}>
          <div className="detail-panel">
            {/* Header */}
            <div className="dp-header">
              <span className={`status-badge ${selectedAgent.status}`}>{selectedAgent.status}</span>
              <span className="dp-header-name">{selectedAgent.name}</span>
              <button className="dp-close" onClick={() => setSelected(null)}>×</button>
            </div>

            {/* Hero */}
            <div className="dp-hero">
              <div className="dp-avatar" style={{ borderColor: selectedAgent.status === "offline" ? "var(--border)" : selectedAgent.color }}>
                <span className="dp-avatar-letter" style={{ color: avatarColor(selectedAgent) }}>{selectedAgent.name[0]}</span>
              </div>
              <div className="dp-agent-info">
                <div className="dp-name">{selectedAgent.name}</div>
                <div className="dp-role">{selectedAgent.role}</div>
                <div style={{ display:"flex", gap:6, marginTop:4 }}>
                  <span className={`status-badge ${selectedAgent.status}`}>{selectedAgent.status}</span>
                  <span style={{ fontFamily:"var(--mono)", fontSize:9, color:"var(--text-faint)", padding:"3px 0" }}>
                    Último sinal: {selectedAgent.last_seen}
                  </span>
                </div>
              </div>
            </div>

            <div className="dp-body">
              {/* Description */}
              <div className="dp-section-label">Descrição</div>
              <div className="dp-description">{selectedAgent.description}</div>

              {/* Signals */}
              <div className="dp-section-label">Sinais</div>
              <div className="dp-signal-block">
                <div className="dp-signal-label"><span className="signal-arrow in">↘</span> Input esperado</div>
                <div className="dp-signal-text">{selectedAgent.input}</div>
              </div>
              <div className="dp-signal-block">
                <div className="dp-signal-label"><span className="signal-arrow out">↗</span> Output produzido</div>
                <div className="dp-signal-text">{selectedAgent.output}</div>
              </div>

              {/* Stats */}
              <div className="dp-section-label">Métricas</div>
              <div className="dp-stats-grid">
                <div className="dp-stat">
                  <div className="dp-stat-val" style={{ color: selectedAgent.tasks_active > 0 ? "var(--cyan)" : "var(--text)" }}>{selectedAgent.tasks_active}</div>
                  <div className="dp-stat-lbl">Tarefas ativas</div>
                </div>
                <div className="dp-stat">
                  <div className="dp-stat-val" style={{ color:"var(--green)" }}>{selectedAgent.tasks_done}</div>
                  <div className="dp-stat-lbl">Concluídas total</div>
                </div>
                <div className="dp-stat" style={{ gridColumn:"1/-1" }}>
                  <div className="dp-stat-val" style={{ color: selectedAgent.cost_week !== "$0.00" ? "var(--amber)" : "var(--text-faint)" }}>{selectedAgent.cost_week}</div>
                  <div className="dp-stat-lbl">Custo esta semana</div>
                </div>
              </div>

              {/* Active tasks */}
              {selectedAgent.tasks.length > 0 && (
                <>
                  <div className="dp-section-label">Tarefas Atribuídas</div>
                  {selectedAgent.tasks.map((t, i) => (
                    <div key={i} className="dp-task-row">
                      <div className="dp-task-prio" style={{ background: t.priority }} />
                      <div className="dp-task-title">{t.title}</div>
                      <div className="dp-task-col" style={{
                        background: t.col === "Done" ? "var(--green-dim)" : t.col === "Review" ? "var(--amber-dim)" : t.col === "In Progress" ? "var(--cyan-dim)" : "rgba(255,255,255,.04)",
                        color: t.col === "Done" ? "var(--green)" : t.col === "Review" ? "var(--amber)" : t.col === "In Progress" ? "var(--cyan)" : "var(--text-faint)",
                      }}>{t.col}</div>
                    </div>
                  ))}
                </>
              )}

              {/* Recent activity */}
              <div className="dp-section-label">Atividade Recente</div>
              {selectedAgent.activity.map((a, i) => (
                <div key={i} className="dp-activity-item">
                  <div className="dp-act-time">{a.time}</div>
                  <div className={`dp-act-tag ${a.tagType}`}>{a.tag}</div>
                  <div className="dp-act-body">{a.text}</div>
                </div>
              ))}

              {/* Command */}
              <div className="dp-section-label">Enviar Comando</div>
              <div className="command-box">
                <textarea
                  placeholder={`Escreva um comando para ${selectedAgent.name}...`}
                  value={command}
                  onChange={e => setCommand(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && e.metaKey) sendCommand(); }}
                />
                <div className="command-footer">
                  <span className="command-hint">⌘ + Enter para enviar</span>
                  <button
                    className={`btn ${command.trim() ? "primary" : ""}`}
                    onClick={sendCommand}
                    style={{ opacity: command.trim() ? 1 : .4 }}
                  >
                    {cmdSent ? "✓ Enviado" : "↵ Enviar"}
                  </button>
                </div>
              </div>
            </div>

            <div className="dp-footer">
              <button className="btn" style={{ flex:1 }}>✎ Editar Agente</button>
              <button className="btn danger">⊗ Arquivar</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
