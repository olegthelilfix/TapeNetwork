---
id: TASK-030
title: '[p2] Make the task store atomic + validated'
status: backlog
type: bug
priority: med
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p2
  - tooling
deps: []
---

## Description

tools/task-mcp/core.mjs allocates the next id then writes with no cross-process exclusion; concurrent creates can collide and overwrite.

## Acceptance criteria

- [ ] createStore(dir) factory instead of module-global
- [ ] exclusive id allocation (open wx + retry) 
- [ ] atomic writes (temp file + fsync + rename)
- [ ] validate MCP args + status/type/priority server-side
- [ ] strict task-filename filter; isolate malformed files instead of breaking the board
- [ ] Node test coverage (CRUD roundtrip, concurrency, malformed, CLI/MCP smoke)

## Notes
