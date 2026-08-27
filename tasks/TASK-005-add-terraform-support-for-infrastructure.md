---
id: TASK-005
title: Add Terraform support for infrastructure provisioning
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

Introduce Terraform as Infrastructure-as-Code (IaC) to provision and manage the
Tape Network stack in a reproducible, version-controlled way. Today the stack is
run locally via `podman compose` / `docker compose`, and there is no codified
cloud infrastructure. Terraform should describe the target hosting environment
so that spinning up (or tearing down) an environment is a single, auditable
command.

Scope covers the three deployables (`backend`, `web`, `cms`) plus the managed
Postgres database, media/object storage for uploads (`tape.media.dir` →
`/uploads/**`), networking, and the secrets/config the apps consume via `.env`.

Suggested layout: a top-level `infra/` (or `terraform/`) directory with reusable
modules and per-environment stacks (`dev`, `staging`, `prod`), remote state, and
locking. This is IaC only — application code and the Docker/Podman build flow are
out of scope here; wiring Terraform into an actual deploy pipeline is tracked
separately in TASK-004 (Deploy pipeline / CD).

## Acceptance criteria

- [ ] `infra/` (or `terraform/`) directory added with a documented module/stack layout
- [ ] Chosen cloud provider(s) and remote state backend (with state locking) agreed and configured
- [ ] Provider and Terraform version constraints pinned (`required_providers`, `required_version`)
- [ ] Resources defined for: backend, web, cms services, managed Postgres, and object storage for media uploads
- [ ] Networking, DNS, and TLS for the public web + CMS + API endpoints described in code
- [ ] Secrets and app config (equivalent of `.env`) sourced from a secrets manager / tfvars, never committed in plaintext
- [ ] Per-environment stacks parameterized (`dev`, `staging`, `prod`) without code duplication
- [ ] `terraform fmt -check`, `terraform validate`, and `terraform plan` run cleanly (ideally added to CI)
- [ ] README documenting how to init/plan/apply/destroy an environment
- [ ] `.gitignore` updated to exclude `.terraform/`, `*.tfstate*`, and `*.tfvars` containing secrets

## Notes
