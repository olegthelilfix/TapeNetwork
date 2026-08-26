---
id: TASK-029
title: '[p2] CMS session handling'
status: backlog
type: chore
priority: med
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p2
  - cms
  - security
deps: []
---

## Description

cms/src/authProvider.ts treats any stored token as authenticated until a request 401s.

## Acceptance criteria

- [ ] check JWT expiry before route entry (UX only, backend stays authoritative)
- [ ] remove token + identity together on 401
- [ ] handle malformed identity JSON
- [ ] optional pre-expiry warning
- [ ] evaluate HTTP-only cookie / BFF vs localStorage

## Notes
