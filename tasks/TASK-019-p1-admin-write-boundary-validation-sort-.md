---
id: TASK-019
title: >-
  [p1] Admin write boundary: validation, sort allowlist, pagination,
  problem-details, locking
status: backlog
type: feature
priority: high
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p1
  - backend
  - api
deps: []
---

## Description

api/AbstractCrudController.java deserializes arbitrary JSON into the model then applies to the entity with no Bean Validation, an unaligned-offset PageRequest.of(start/size, size), a raw _sort passed to Sort.by, and no optimistic locking.

## Acceptance criteria

- [ ] resource-specific create/update DTOs with @Valid + relation-id validation
- [ ] allowlisted sort fields
- [ ] correct offset pageable (or cursor)
- [ ] RFC 9457 problem details for 400/404/409/500
- [ ] @Version optimistic locking -> 409 on conflict

## Notes
