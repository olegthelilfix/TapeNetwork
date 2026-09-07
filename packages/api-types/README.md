# @tape/api-types

TypeScript types generated from the backend OpenAPI schema, shared by `web` and `cms`.

The backend exposes two springdoc groups, discoverable at `/v3/api-docs/swagger-config`:

- `user` — `/api/v1/**`, consumed by `web`
- `cms` — `/api/admin/**`, consumed by `cms`

Two kinds of artifact live under `generated/` and are committed so `web`/`cms` build without a
running backend of their own:

- `generated/{user,cms}-openapi.json` — the raw OpenAPI specs, refreshed by `yarn pull-openapi`.

Pulling and generating are manual, on-demand steps — not part of any build — so run them whenever
the API changes. Both need a real backend running (compose handles the postgres dependency):

```bash
# start a backend
docker compose up -d postgres backend

# 1. refresh the committed specs -> generated/{user,cms}-openapi.json
cd packages/api-types && yarn pull-openapi

# 2. regenerate api controllers for web app:
cd web && yarn gen:api
```

See `scripts/pull-openapi.mjs` for the pull step; it discovers the configured groups from
`/v3/api-docs/swagger-config` automatically.
