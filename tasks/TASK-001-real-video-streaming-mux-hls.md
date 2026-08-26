---
id: TASK-001
title: Real video streaming (Mux/HLS)
status: backlog
type: feature
priority: high
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - backend
  - web
  - video
deps: []
---

## Description

Replace the v1 stub player with real adaptive streaming. Evaluate Mux vs Cloudflare Stream vs self-hosted HLS. Store playback IDs on episode/video; render an HLS player on /watch.

## Acceptance criteria

- [ ] Provider chosen and documented
- [ ] episode/video carry a real playback source
- [ ] /watch plays adaptive HLS
- [ ] live + VOD both supported

## Notes
