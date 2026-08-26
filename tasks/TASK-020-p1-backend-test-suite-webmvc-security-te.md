---
id: TASK-020
title: '[p1] Backend test suite (WebMvc security + Testcontainers + integration)'
status: backlog
type: chore
priority: high
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p1
  - tests
  - backend
deps: []
---

## Description

Only two backend test classes exist. Build the real pyramid.

## Acceptance criteria

- [ ] @WebMvcTest security/controller tests
- [ ] Testcontainers Postgres for Flyway/repositories/tx
- [ ] integration: login, RBAC, CRUD validation, upload handling, search, public published-filtering
- [ ] query-count regressions for catalog/home/sitemap
- [ ] one prod-profile context-start test

## Notes
