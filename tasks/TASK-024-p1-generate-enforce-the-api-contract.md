---
id: TASK-024
title: '[p1] Generate & enforce the API contract'
status: backlog
type: feature
priority: high
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p1
  - api
  - dx
  - ci
deps: []
---

## Description

packages/api-types is a placeholder; web/src/lib/api/types.ts is hand-maintained and the CMS uses independent field descriptions -> drift risk.

## Acceptance criteria

- [ ] deterministic OpenAPI exported during backend build
- [ ] TS types generated into the shared package
- [ ] web + CMS import the generated types
- [ ] CI fails if regeneration produces a diff
- [ ] schema tests for error responses, pagination headers, nullable fields

## Notes
