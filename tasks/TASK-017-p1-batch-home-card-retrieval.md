---
id: TASK-017
title: '[p1] Batch home-card retrieval'
status: backlog
type: bug
priority: med
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p1
  - perf
  - backend
deps: []
---

## Description

service/HomeService.java fetches each referenced episode/video individually (one findById per home_block).

## Acceptance criteria

- [ ] group refIds by type, two findAllById calls, restore configured order
- [ ] query-count test

## Notes
