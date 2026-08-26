---
id: TASK-031
title: '[p2] Domain integrity (locking, indexes, numeric values, auditing)'
status: backlog
type: feature
priority: med
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p2
  - backend
  - db
deps: []
---

## Description

Values like price/change/views are stored as display strings; counts are stored denormalized; no auditing.

## Acceptance criteria

- [ ] optimistic locking on editable entities
- [ ] unique/index constraints matching real query patterns
- [ ] store numbers as numbers (price, % change, views), format at the edge
- [ ] audit fields (updatedAt already; add editor identity)
- [ ] derive or transactionally maintain denormalized counts (episodesCount)
- [ ] ensure public repo methods filter published=true in-query

## Notes
