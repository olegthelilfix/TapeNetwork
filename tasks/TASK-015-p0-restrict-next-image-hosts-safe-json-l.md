---
id: TASK-015
title: '[p0] Restrict next/image hosts + safe JSON-LD serializer'
status: backlog
type: bug
priority: high
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p0
  - security
  - web
deps: []
---

## Description

web/next.config.mjs allows the image optimizer to fetch any http/https host. JSON-LD in layout.tsx, articles/[slug]/page.tsx and watch/[slug]/page.tsx uses JSON.stringify via dangerouslySetInnerHTML -> CMS strings containing </script> can break out.

## Acceptance criteria

- [ ] remotePatterns limited to backend/media host(s)
- [ ] one shared <JsonLd> component that escapes at least < as \\u003c
- [ ] regression test with a </script><script> payload

## Notes
