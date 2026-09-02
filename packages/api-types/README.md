# @tape/api-types

TypeScript types generated from the backend OpenAPI schema, shared by `web` and `cms`.

The backend exposes two springdoc groups: `user` (`/api/v1/**`, consumed by `web`) and `cms`
(`/api/admin/**`, consumed by `cms`). Pulling and generating types is a manual, on-demand step —
not part of any build — so run it whenever the API changes:

```bash
# 1. start a real backend (needs postgres too; compose handles the dependency)
docker compose up -d postgres backend

# 2. pull the current schema(s) into generated/{user,cms}-openapi.json (+ .yaml)
cd packages/api-types && npm run pull-openapi

# 3. generate TypeScript types from whichever group you need
npx openapi-typescript generated/user-openapi.json -o generated/api.ts
```

`generated/` is committed to the repo so `web`/`cms` can consume it without needing a running
backend themselves. See `scripts/pull-openapi.mjs` for the pull step; it discovers configured
groups from `/v3/api-docs/swagger-config` automatically.
