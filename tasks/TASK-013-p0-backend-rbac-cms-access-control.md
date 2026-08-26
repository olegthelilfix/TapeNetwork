---
id: TASK-013
title: '[p0] Backend RBAC + CMS access control'
status: backlog
type: feature
priority: high
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p0
  - security
  - backend
  - cms
deps: []
---

## Description

application/SecurityConfig.java only requires authentication for /api/admin/**, so any authenticated account can hit every create/update/upload/delete in api/AbstractCrudController.java. CMS reads role (cms/src/authProvider.ts) but does not enforce it.

## Acceptance criteria

- [ ] capability matrix (VIEWER/AUTHOR/EDITOR/ADMIN)
- [ ] @EnableMethodSecurity + @PreAuthorize at admin controller/service boundaries
- [ ] ownership checks where applicable (author edits own)
- [ ] Refine accessControlProvider mirrors it (UI is convenience only)
- [ ] authorization test for EVERY admin endpoint
- [ ] audit denied/destructive actions

## Notes
