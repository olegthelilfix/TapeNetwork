---
id: TASK-009
title: End-to-end run on podman
status: deployed
type: chore
priority: med
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - infra
  - verification
deps: []
---

## Description

Bring the full stack up with podman compose (postgres + backend + web + cms). Found & fixed two real bugs (tags array mapping, admin bcrypt hash via V3).

## Acceptance criteria

- [ ] All 4 containers healthy
- [ ] Flyway + mass-index OK
- [ ] CMS create persists to Postgres

## Notes
