#!/usr/bin/env node
// Human CLI over the task store. Usage:
//   node cli.mjs board [--html]      show the board (terminal, or write tasks/board.html)
//   node cli.mjs list [status]       list tasks (optionally filtered by swimlane)
//   node cli.mjs show <id>           print one task in full
//   node cli.mjs new "Title" [--type feature --priority high --status todo]
//   node cli.mjs move <id> <status>  move a task to a swimlane
//   node cli.mjs note <id> "text"    append a dated note
import fs from "node:fs";
import path from "node:path";
import { STATUSES, TASKS_DIR, loadAll, getById, createTask, moveTask, addNote, board } from "./core.mjs";

const C = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  gold: (s) => `\x1b[33m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};
const prioColor = { high: C.red, med: C.gold, low: C.dim };

function flags(args) {
  const out = { _: [] };
  for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) out[args[i].slice(2)] = args[i + 1]?.startsWith("--") || args[i + 1] === undefined ? true : args[++i];
    else out._.push(args[i]);
  }
  return out;
}

function taskLine(t) {
  const p = (prioColor[t.priority] ?? C.dim)(`[${t.priority}]`);
  const tags = t.tags.length ? C.dim(" #" + t.tags.join(" #")) : "";
  return `  ${C.cyan(t.id)} ${p} ${t.title} ${C.dim("(" + t.type + ")")}${tags}`;
}

function printBoard() {
  const cols = board();
  const total = cols.reduce((n, c) => n + c.tasks.length, 0);
  console.log(C.bold(`\n  TAPE · task board`) + C.dim(`  (${total} tasks · ${TASKS_DIR})`) + "\n");
  for (const col of cols) {
    const head = `${col.status.toUpperCase()} (${col.tasks.length})`;
    console.log("  " + C.gold(C.bold(head)));
    if (!col.tasks.length) console.log(C.dim("    —"));
    for (const t of col.tasks) console.log(taskLine(t));
    console.log("");
  }
}

function esc(s) {
  return String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function writeHtml() {
  const cols = board();
  const columns = cols.map((col) => `
    <section class="col">
      <h2>${col.status.replace(/-/g, " ")} <span>${col.tasks.length}</span></h2>
      ${col.tasks.map((t) => `
        <article class="card p-${esc(t.priority)}">
          <div class="id">${esc(t.id)} <span class="type">${esc(t.type)}</span></div>
          <div class="title">${esc(t.title)}</div>
          <div class="meta">
            <span class="prio ${esc(t.priority)}">${esc(t.priority)}</span>
            ${t.tags.map((x) => `<span class="tag">${esc(x)}</span>`).join("")}
          </div>
        </article>`).join("")}
    </section>`).join("");

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Tape · Task Board</title>
<style>
  :root{--bg:#08090b;--surface:#101216;--surface2:#15181f;--border:rgba(255,255,255,.08);--text:#e9ebf0;--dim:#8a90a0;--gold:#f0b429;--red:#e5484d;--green:#2fbf71}
  *{box-sizing:border-box} body{margin:0;background:var(--bg);color:var(--text);font:14px/1.5 system-ui,sans-serif;padding:24px}
  h1{font:700 20px/1 Georgia,serif;letter-spacing:-.02em;margin:0 0 4px} .sub{color:var(--dim);font:11px/1 monospace;letter-spacing:.1em;text-transform:uppercase;margin-bottom:20px}
  .board{display:flex;gap:16px;overflow-x:auto;padding-bottom:12px} .col{flex:0 0 260px;min-width:260px}
  .col h2{font:600 11px/1 monospace;letter-spacing:.14em;text-transform:uppercase;color:var(--gold);padding-bottom:10px;border-bottom:1px solid var(--border);margin:0 0 12px;display:flex;justify-content:space-between}
  .col h2 span{color:var(--dim)}
  .card{background:var(--surface);border:1px solid var(--border);border-left:3px solid var(--dim);border-radius:4px;padding:12px;margin-bottom:10px}
  .card.p-high{border-left-color:var(--red)} .card.p-med{border-left-color:var(--gold)} .card.p-low{border-left-color:var(--dim)}
  .id{font:11px/1 monospace;color:var(--gold);letter-spacing:.06em;margin-bottom:6px} .id .type{color:var(--dim);float:right;text-transform:uppercase}
  .title{font:600 15px/1.25 Georgia,serif;margin-bottom:8px}
  .meta{display:flex;flex-wrap:wrap;gap:5px} .prio,.tag{font:10px/1 monospace;letter-spacing:.05em;padding:3px 6px;border-radius:2px;text-transform:uppercase}
  .prio{color:#08090b} .prio.high{background:var(--red);color:#fff} .prio.med{background:var(--gold)} .prio.low{background:var(--surface2);color:var(--dim)}
  .tag{background:var(--surface2);color:var(--dim)}
</style></head><body>
<h1>TAPE · Task Board</h1><div class="sub">${cols.reduce((n,c)=>n+c.tasks.length,0)} tasks · generated locally</div>
<div class="board">${columns}</div>
</body></html>`;
  const out = path.join(TASKS_DIR, "board.html");
  fs.writeFileSync(out, html);
  console.log("Wrote " + out);
}

function showTask(id) {
  const t = getById(id);
  if (!t) { console.error("Not found: " + id); process.exit(1); }
  console.log(`\n${C.cyan(t.id)}  ${C.bold(t.title)}`);
  console.log(C.dim(`status=${t.status}  type=${t.type}  priority=${t.priority}  assignee=${t.assignee ?? "-"}`));
  console.log(C.dim(`created=${t.created}  updated=${t.updated}  tags=[${t.tags.join(", ")}]  deps=[${t.deps.join(", ")}]`));
  console.log("\n" + t.body + "\n");
}

const args = process.argv.slice(2);
const cmd = args[0];
const f = flags(args.slice(1));

try {
  switch (cmd) {
    case "board": f.html ? writeHtml() : printBoard(); break;
    case "list": {
      const status = f._[0];
      const list = loadAll().filter((t) => !status || t.status === status);
      for (const t of list) console.log(taskLine(t).trimStart());
      break;
    }
    case "show": showTask(f._[0]); break;
    case "new": {
      const t = createTask({ title: f._[0], type: f.type, priority: f.priority, status: f.status, description: f.desc, tags: f.tags ? String(f.tags).split(",") : [] });
      console.log("Created " + t.id + " → " + t.file);
      break;
    }
    case "move": console.log("Moved " + moveTask(f._[0], f._[1]).id + " → " + f._[1]); break;
    case "note": console.log("Noted on " + addNote(f._[0], f._.slice(1).join(" ")).id); break;
    default:
      console.log(`tasks — markdown task board\n
  board [--html]      show board (terminal or write tasks/board.html)
  list [status]       list tasks
  show <id>           show one task
  new "Title" [--type feature --priority high --status todo --tags a,b]
  move <id> <status>  ${STATUSES.join(" | ")}
  note <id> "text"    append a dated note`);
  }
} catch (e) {
  console.error("Error: " + e.message);
  process.exit(1);
}
