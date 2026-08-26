---
id: TASK-003
title: Market-data provider for the ticker
status: backlog
type: feature
priority: med
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - backend
  - data
deps: []
---

## Description

Wire a real market-data source for the ticker instead of static seed quotes. Poll/stream quotes, cache, expose via /api/v1/ticker.

## Acceptance criteria

- [ ] Provider integrated
- [ ] quotes refresh on an interval
- [ ] graceful fallback to last-known

## Notes
