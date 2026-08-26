---
id: TASK-028
title: '[p2] Search correctness (global limit, published filter, ranking)'
status: backlog
type: bug
priority: med
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p2
  - backend
  - search
deps: []
---

## Description

service/SearchService.java runs four per-type searches and applies the limit to each -> an 'all' search returns up to 4x limit with no global relevance and no published filter.

## Acceptance criteria

- [ ] multi-entity or merged scored results with one global limit
- [ ] filter unpublished content
- [ ] deterministic tie-breaking

## Notes
