---
id: TASK-012
title: '[p0] Move dev admin + seed content out of production migrations'
status: backlog
type: chore
priority: high
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p0
  - security
  - db
deps: []
---

## Description

V2__seed.sql seeds sample content and V3__fix_admin_password.sql creates admin@tape.local / password. A known admin must never ship to prod.

## Acceptance criteria

- [ ] dev seed + dev admin only under local/test (not baseline prod migrations)
- [ ] first admin bootstrapped via env-injected hash or one-shot command
- [ ] prod startup fails if dev credentials are enabled

## Notes
