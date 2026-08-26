---
id: TASK-025
title: '[p1] Static analysis + meaningful CI gates'
status: backlog
type: chore
priority: high
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p1
  - ci
  - dx
  - security
deps:
  - TASK-010
---

## Description

.github/workflows/ci.yml only compiles/builds. Add real gates.

## Acceptance criteria

- [ ] Spotless (Java) + SpotBugs/Error Prone
- [ ] ESLint (TS + React Hooks) + Prettier
- [ ] run CMS + task-tool tests
- [ ] OpenAPI drift check
- [ ] docker builds + compose smoke test
- [ ] dependency review on PRs + Dependabot/Renovate
- [ ] scheduled vuln + container image scans (gate NEW high/critical reachable issues, triage existing separately)

## Notes
