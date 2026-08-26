---
id: TASK-007
title: MCP markdown task board
status: in-review
type: chore
priority: med
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - tooling
  - mcp
  - dx
deps: []
---

## Description

This tool: markdown-file task tracker with swimlanes, a human CLI (terminal + HTML board) and an MCP stdio server so the AI can query/update tasks. Registered in .mcp.json.

## Acceptance criteria

- [ ] 1 md file per task w/ frontmatter
- [ ] CLI board + show + move + note
- [ ] MCP tools: board/list/get/create/update/move/add_note
- [ ] registered in .mcp.json

## Notes
- **2026-08-25** — Built: markdown store + CLI (terminal & HTML board) + MCP stdio server (7 tools), registered in .mcp.json. Smoke-tested end-to-end. Awaiting review.
