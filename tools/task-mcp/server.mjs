#!/usr/bin/env node
// MCP stdio server exposing the markdown task board to an AI client (e.g. Claude Code).
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { ListToolsRequestSchema, CallToolRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import {
  STATUSES, TYPES, PRIORITIES,
  loadAll, getById, createTask, updateTask, moveTask, addNote, board,
} from "./core.mjs";

const server = new Server(
  { name: "tape-tasks", version: "0.1.0" },
  { capabilities: { tools: {} } }
);

const summary = (t) => ({ id: t.id, title: t.title, status: t.status, type: t.type, priority: t.priority, tags: t.tags });
const text = (obj) => ({ content: [{ type: "text", text: typeof obj === "string" ? obj : JSON.stringify(obj, null, 2) }] });

const TOOLS = [
  {
    name: "board",
    description: "Show the whole task board grouped by swimlane (backlog → done). Use this first to see project state.",
    inputSchema: { type: "object", properties: {} },
    run: () => text(board().map((c) => ({ status: c.status, count: c.tasks.length, tasks: c.tasks.map(summary) }))),
  },
  {
    name: "list_tasks",
    description: "List tasks, optionally filtered by status, type, assignee or tag.",
    inputSchema: {
      type: "object",
      properties: {
        status: { type: "string", enum: STATUSES },
        type: { type: "string", enum: TYPES },
        assignee: { type: "string" },
        tag: { type: "string" },
      },
    },
    run: (a) => text(loadAll().filter((t) =>
      (!a.status || t.status === a.status) &&
      (!a.type || t.type === a.type) &&
      (!a.assignee || t.assignee === a.assignee) &&
      (!a.tag || t.tags.includes(a.tag))
    ).map(summary)),
  },
  {
    name: "get_task",
    description: "Get one task in full (metadata + markdown body with description, acceptance criteria and notes).",
    inputSchema: { type: "object", properties: { id: { type: "string" } }, required: ["id"] },
    run: (a) => {
      const t = getById(a.id);
      if (!t) throw new Error(`Task not found: ${a.id}`);
      const { _data, file, ...rest } = t;
      return text(rest);
    },
  },
  {
    name: "create_task",
    description: "Create a new task. Returns the assigned id.",
    inputSchema: {
      type: "object",
      properties: {
        title: { type: "string" },
        type: { type: "string", enum: TYPES },
        priority: { type: "string", enum: PRIORITIES },
        status: { type: "string", enum: STATUSES },
        description: { type: "string" },
        acceptance: { type: "array", items: { type: "string" } },
        tags: { type: "array", items: { type: "string" } },
        assignee: { type: "string" },
      },
      required: ["title"],
    },
    run: (a) => text(summary(createTask(a))),
  },
  {
    name: "update_task",
    description: "Update fields of a task (title/status/type/priority/assignee/tags/deps or full body).",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        status: { type: "string", enum: STATUSES },
        type: { type: "string", enum: TYPES },
        priority: { type: "string", enum: PRIORITIES },
        assignee: { type: "string" },
        tags: { type: "array", items: { type: "string" } },
        deps: { type: "array", items: { type: "string" } },
        body: { type: "string" },
      },
      required: ["id"],
    },
    run: (a) => { const { id, ...fields } = a; return text(summary(updateTask(id, fields))); },
  },
  {
    name: "move_task",
    description: `Move a task to a swimlane (${STATUSES.join(" | ")}).`,
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, status: { type: "string", enum: STATUSES } },
      required: ["id", "status"],
    },
    run: (a) => text(summary(moveTask(a.id, a.status))),
  },
  {
    name: "add_note",
    description: "Append a dated note to a task's Notes section (progress log, decisions, blockers).",
    inputSchema: {
      type: "object",
      properties: { id: { type: "string" }, note: { type: "string" } },
      required: ["id", "note"],
    },
    run: (a) => { addNote(a.id, a.note); return text(`Noted on ${a.id}.`); },
  },
];

const byName = Object.fromEntries(TOOLS.map((t) => [t.name, t]));

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: TOOLS.map(({ name, description, inputSchema }) => ({ name, description, inputSchema })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = byName[req.params.name];
  if (!tool) throw new Error(`Unknown tool: ${req.params.name}`);
  try {
    return tool.run(req.params.arguments ?? {});
  } catch (e) {
    return { content: [{ type: "text", text: "Error: " + e.message }], isError: true };
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
console.error("tape-tasks MCP server running on stdio");
