---
id: TASK-006
title: Load/performance tests for backend public API
status: backlog
type: chore
priority: med
assignee: null
created: '2026-08-27'
updated: '2026-08-27'
tags: []
deps: []
---

## Description

Build an automated load/performance test suite for the backend, driving the
public REST API (`/api/v1`) and derived from the OpenAPI/Swagger specification
that the backend already exposes (`/swagger-ui.html`, OpenAPI JSON via
`OpenApiConfig`). Admin endpoints (`/api/admin`) are out of scope.

The suite should exercise the real read paths the public web (`web/`) hits:
content listings and detail lookups by `slug`, pagination (`PagedResponse`), and
full-text search (`SearchHit`) — since search runs on Hibernate Search/Lucene and
is the most likely hotspot. Prefer generating request coverage from the Swagger
spec so new endpoints are picked up automatically rather than hand-maintained.

Pick a load-testing tool (e.g. k6, Gatling, or Locust) and define repeatable
scenarios with target throughput, ramp-up profiles, and pass/fail thresholds on
latency and error rate. Runs should be reproducible against the Docker/Podman
stack and produce a shareable report.

## Acceptance criteria

- [ ] Load-testing tool chosen and committed under a dedicated dir (e.g. `perf/` or `backend/perf/`)
- [ ] Test scenarios generated from / validated against the OpenAPI (Swagger) spec of the public `/api/v1` API
- [ ] Scenarios cover: listings, detail-by-slug lookups, pagination, and full-text search
- [ ] Configurable load profile (virtual users / RPS, ramp-up, duration) via parameters, not hardcoded
- [ ] Pass/fail thresholds defined for p95/p99 latency and error rate
- [ ] Runs reproducibly against the local `podman compose` / `docker compose` stack
- [ ] Generates a results report (HTML/JSON summary) with throughput and latency percentiles
- [ ] README documenting how to run a load test and interpret the output
- [ ] Admin API (`/api/admin`) explicitly excluded from scope

## Notes
