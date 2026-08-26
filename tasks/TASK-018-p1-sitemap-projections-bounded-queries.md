---
id: TASK-018
title: '[p1] Sitemap projections + bounded queries'
status: backlog
type: bug
priority: med
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p1
  - perf
  - backend
deps: []
---

## Description

api/SitemapController.java uses unbounded findAll() and dereferences category relations while building the response.

## Acceptance criteria

- [ ] lightweight projections (slug + updatedAt only)
- [ ] join-fetch needed relations
- [ ] paginate or stream output

## Notes
