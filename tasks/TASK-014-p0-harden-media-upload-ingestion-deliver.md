---
id: TASK-014
title: '[p0] Harden media upload ingestion & delivery'
status: backlog
type: feature
priority: high
assignee: null
created: '2026-08-25'
updated: '2026-08-25'
tags:
  - p0
  - security
  - backend
deps: []
---

## Description

api/MediaUploadController.java trusts client Content-Type, keeps the extension, and serves under the app origin at /uploads/** -> storage abuse + stored XSS via HTML/active SVG. (Filename path-traversal is already mitigated; the risk is content + delivery.)

## Acceptance criteria

- [ ] reject empty files; per-kind size limits
- [ ] detect type from bytes, not MultipartFile.getContentType()
- [ ] allowlist formats; reject HTML/SVG(unless sanitized)/scripts/archives/executables
- [ ] re-encode images where practical; UUID names + server-chosen extension
- [ ] store outside the web root; serve via controlled endpoint or media origin with X-Content-Type-Options: nosniff + restrictive CSP
- [ ] tests: malicious content, oversized, spoofed MIME, filename edge cases
- [ ] keep client-side check (MediaUploadField.tsx) as UX only

## Notes
