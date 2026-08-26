---
id: TASK-036
title: '[p3] Production hardening flags'
status: backlog
type: chore
priority: med
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p3
  - ops
  - security
deps: []
---

## Description

Prod-only tightening currently absent.

## Acceptance criteria

- [ ] restrict/disable Swagger in prod
- [ ] flyway baseline-on-migrate=false in prod
- [ ] production security headers (nosniff, frame options, HSTS, CSP)

## Notes
