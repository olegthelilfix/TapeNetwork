---
id: TASK-011
title: '[p0] Spring profiles + fail-fast on missing prod secrets'
status: backlog
type: chore
priority: high
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p0
  - security
  - backend
  - config
deps: []
---

## Description

application.yml (tape.security.jwt-secret) and docker-compose.yml default a known JWT secret. Under a prod profile there must be no fallback.

## Acceptance criteria

- [ ] local/test/prod Spring profiles
- [ ] prod requires JWT_SECRET (no default) and validates >= 256 bits at startup
- [ ] startup fails fast if a dev secret is present under prod
- [ ] integration test: prod context refuses to start without required secrets
- [ ] remove secret default from docker-compose

## Notes
