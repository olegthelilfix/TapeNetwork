// Core task store: one markdown file per task under tasks/, YAML frontmatter + body.
// Shared by the CLI (human) and the MCP server (AI).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// tasks/ lives at the repo root (two levels up from tools/task-mcp), overridable via env.
export const TASKS_DIR = process.env.TASKS_DIR
  ? path.resolve(process.env.TASKS_DIR)
  : path.resolve(__dirname, "..", "..", "tasks");

// Swimlanes, in board order. First is the default for new tasks (backlog).
export const STATUSES = [
  "backlog",
  "ready-for-development",
  "in-development",
  "in-review",
  "ready-for-qa",
  "testing",
  "ready-to-deploy",
  "deployed",
];
export const TYPES = ["feature", "bug", "chore", "spike"];
export const PRIORITIES = ["low", "med", "high"];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function ensureDir() {
  fs.mkdirSync(TASKS_DIR, { recursive: true });
}

function slugify(s) {
  return String(s).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "task";
}

/** Read and parse every task file. Returns objects sorted by id. */
export function loadAll() {
  ensureDir();
  const files = fs.readdirSync(TASKS_DIR).filter((f) => f.endsWith(".md") && f.toLowerCase() !== "readme.md");
  const tasks = files.map((file) => {
    const raw = fs.readFileSync(path.join(TASKS_DIR, file), "utf8");
    const { data, content } = matter(raw);
    return {
      file,
      id: data.id ?? file.replace(/\.md$/, ""),
      title: data.title ?? "(untitled)",
      status: STATUSES.includes(data.status) ? data.status : "backlog",
      type: data.type ?? "feature",
      priority: data.priority ?? "med",
      assignee: data.assignee ?? null,
      created: data.created ?? null,
      updated: data.updated ?? null,
      tags: Array.isArray(data.tags) ? data.tags : [],
      deps: Array.isArray(data.deps) ? data.deps : [],
      body: content.trim(),
      _data: data,
    };
  });
  tasks.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }));
  return tasks;
}

export function getById(id) {
  return loadAll().find((t) => t.id.toLowerCase() === String(id).toLowerCase()) ?? null;
}

function nextId() {
  const nums = loadAll()
    .map((t) => /TASK-(\d+)/i.exec(t.id))
    .filter(Boolean)
    .map((m) => parseInt(m[1], 10));
  const next = (nums.length ? Math.max(...nums) : 0) + 1;
  return "TASK-" + String(next).padStart(3, "0");
}

function writeTask(t) {
  const data = {
    id: t.id,
    title: t.title,
    status: t.status,
    type: t.type,
    priority: t.priority,
    assignee: t.assignee ?? null,
    created: t.created,
    updated: t.updated,
    tags: t.tags ?? [],
    deps: t.deps ?? [],
  };
  const out = matter.stringify(("\n" + (t.body ?? "").trim() + "\n"), data);
  fs.writeFileSync(path.join(TASKS_DIR, t.file), out);
  return t;
}

export function createTask(fields) {
  ensureDir();
  const id = nextId();
  const title = fields.title?.trim() || "Untitled task";
  const t = {
    file: `${id}-${slugify(title)}.md`,
    id,
    title,
    status: STATUSES.includes(fields.status) ? fields.status : "backlog",
    type: TYPES.includes(fields.type) ? fields.type : "feature",
    priority: PRIORITIES.includes(fields.priority) ? fields.priority : "med",
    assignee: fields.assignee ?? null,
    created: today(),
    updated: today(),
    tags: Array.isArray(fields.tags) ? fields.tags : [],
    deps: Array.isArray(fields.deps) ? fields.deps : [],
    body: bodyTemplate(fields.description, fields.acceptance),
  };
  return writeTask(t);
}

function bodyTemplate(description, acceptance) {
  const ac = Array.isArray(acceptance) && acceptance.length
    ? acceptance.map((a) => `- [ ] ${a}`).join("\n")
    : "- [ ] ";
  return `## Description\n\n${description?.trim() || "_TBD_"}\n\n## Acceptance criteria\n\n${ac}\n\n## Notes\n`;
}

const MUTABLE = ["title", "status", "type", "priority", "assignee", "tags", "deps"];

export function updateTask(id, fields) {
  const t = getById(id);
  if (!t) throw new Error(`Task not found: ${id}`);
  for (const k of MUTABLE) {
    if (fields[k] !== undefined) t[k] = fields[k];
  }
  if (fields.status && !STATUSES.includes(fields.status)) throw new Error(`Invalid status: ${fields.status}`);
  if (typeof fields.body === "string") t.body = fields.body;
  t.updated = today();
  return writeTask(t);
}

export function moveTask(id, status) {
  if (!STATUSES.includes(status)) throw new Error(`Invalid status: ${status}`);
  return updateTask(id, { status });
}

export function addNote(id, note) {
  const t = getById(id);
  if (!t) throw new Error(`Task not found: ${id}`);
  const line = `- **${today()}** — ${note.trim()}`;
  if (/##\s*Notes/i.test(t.body)) {
    t.body = t.body.replace(/(##\s*Notes\s*)/i, `$1\n${line}\n`);
  } else {
    t.body = `${t.body}\n\n## Notes\n\n${line}\n`;
  }
  t.updated = today();
  return writeTask(t);
}

export function board() {
  const all = loadAll();
  return STATUSES.map((status) => ({
    status,
    tasks: all.filter((t) => t.status === status),
  }));
}
