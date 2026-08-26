---
id: TASK-032
title: '[p3] Container hardening & reproducibility'
status: backlog
type: chore
priority: med
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p3
  - ops
  - docker
deps: []
---

## Description

web/cms Dockerfiles use npm install (not ci); backend image only builds with -DskipTests; containers run as root; cms nginx uses port 80.

## Acceptance criteria

- [ ] npm ci in web + cms images
- [ ] backend image not solely dependent on -DskipTests
- [ ] run app containers as non-root; unprivileged nginx + non-priv port for cms
- [ ] pin base image major versions then digests
- [ ] read-only rootfs + explicit writable mounts where practical
- [ ] compose healthchecks + restart policy (treat compose as dev, not prod orchestration)

## Notes
