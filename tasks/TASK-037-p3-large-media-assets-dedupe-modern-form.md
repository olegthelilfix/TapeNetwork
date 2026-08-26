---
id: TASK-037
title: '[p3] Large media assets (dedupe + modern formats)'
status: backlog
type: chore
priority: low
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p3
  - assets
  - web
deps: []
---

## Description

~47 MB of large PNGs incl. byte-identical pairs; served from public/uploads.

## Acceptance criteria

- [ ] remove duplicate PNGs
- [ ] convert delivery assets to WebP/AVIF
- [ ] keep source originals in object storage or Git LFS if versioned
- [ ] retain the authored .dc.html designs; do not refactor generated prototype/support.js

## Notes
