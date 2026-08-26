# Tape task board — markdown "mini-Jira" + MCP

A tiny, offline task tracker. **One markdown file per task** under [`tasks/`](../../tasks),
with YAML frontmatter (status = swimlane). Two ways to use it:

- **Humans** — a CLI that prints a board in the terminal or writes a self-contained HTML board.
- **AI (Claude Code)** — an MCP stdio server so the assistant can read and update tasks directly.

## Swimlanes

`backlog → todo → in-progress → review → blocked → done`

## Task file

```markdown
---
id: TASK-001
title: Real video streaming
status: backlog        # swimlane
type: feature          # feature | bug | chore | spike
priority: high         # low | med | high
assignee: null
created: 2026-08-25
updated: 2026-08-25
tags: [backend, video]
deps: [TASK-002]
---

## Description
...
## Acceptance criteria
- [ ] ...
## Notes
- **2026-08-25** — progress log
```

## CLI (humans)

```bash
cd tools/task-mcp        # first time: npm install
node cli.mjs board             # colored board in the terminal
node cli.mjs board --html      # write tasks/board.html (open it in a browser)
node cli.mjs list [status]     # list tasks (optionally by swimlane)
node cli.mjs show TASK-001     # full task
node cli.mjs new "Title" --type feature --priority high --status todo --tags a,b
node cli.mjs move TASK-001 in-progress
node cli.mjs note TASK-001 "figured out the HLS provider"
```

## MCP server (AI)

Registered in the repo-root [`.mcp.json`](../../.mcp.json), so Claude Code picks it up
automatically. Tools: `board`, `list_tasks`, `get_task`, `create_task`, `update_task`,
`move_task`, `add_note`.

Run standalone (stdio):

```bash
node tools/task-mcp/server.mjs
```

## Notes

- Storage location can be overridden with `TASKS_DIR=/path node cli.mjs board`.
- `tasks/board.html` is generated (git-ignored) — regenerate anytime with `board --html`.
- No external services; everything is files in the repo, versioned with the code.
