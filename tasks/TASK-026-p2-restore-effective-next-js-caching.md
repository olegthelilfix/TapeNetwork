---
id: TASK-026
title: '[p2] Restore effective Next.js caching'
status: backlog
type: chore
priority: med
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p2
  - web
  - perf
deps: []
---

## Description

Most routes declare export const dynamic = 'force-dynamic' though api/client.ts already supplies revalidation.

## Acceptance criteria

- [ ] drop force-dynamic on routes without request-specific state; use ISR/fetch revalidate
- [ ] wrap shared detail loaders (used by metadata + page) in React cache()
- [ ] cache tags + invalidate after CMS publish
- [ ] keep dynamic for search and request-dependent routes

## Notes
