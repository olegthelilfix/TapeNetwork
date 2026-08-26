---
id: TASK-016
title: '[p1] Fix catalog N+1 (aggregate count projections)'
status: backlog
type: bug
priority: high
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

service/CatalogService.java loads subcategories per category and every published video per subcategory just to count them; cost scales with catalog size.

## Acceptance criteria

- [ ] repository aggregate projections fetch category metadata + subcategory/video counts in bounded queries
- [ ] query-count regression test proving the budget is independent of result count

## Notes
