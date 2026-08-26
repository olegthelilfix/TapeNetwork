---
id: TASK-038
title: '[p3] Next.js 15 upgrade (promise route params)'
status: done
type: chore
priority: low
assignee: null
created: '2026-08-25'
updated: '2026-08-26'
tags:
  - p3
  - web
  - upgrade
deps: []
---

## Description

Synchronous params/searchParams are valid on Next 14.2.35; Next 15+ makes them promise-based. This is an upgrade task, not a current defect.

## Acceptance criteria

- [x] upgrade Next.js to 15+
- [x] convert route params/searchParams to async
- [x] re-verify build + tests

## Notes

- Upgraded `next` 14.2.35 → 15.5.24 (React kept at 18.3.1, supported by Next 15).
- Converted `params`/`searchParams` to `Promise<...>` + `await` in all dynamic routes and
  the `/articles` and `/search` pages (component bodies and every `generateMetadata`).
- Verified 2026-08-26: `tsc --noEmit` clean, `vitest` 5/5, `next build` succeeds (13 routes).
