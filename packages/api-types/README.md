# @tape/api-types

TypeScript types generated from the backend OpenAPI schema, shared by `web` and `cms`.

The backend exposes two springdoc groups, discoverable at `/v3/api-docs/swagger-config`:

- `user` — `/api/v1/**`, consumed by `web`
- `cms` — `/api/admin/**`, consumed by `cms`

Two kinds of artifact live under `generated/` and are committed so `web`/`cms` build without a
running backend of their own:

- `generated/{user,cms}-openapi.json` — the raw OpenAPI specs, refreshed by `npm run pull-openapi`.
- `generated/api.ts` — TypeScript types for the **`user`** group, consumed by `web`. (`cms` has no
  generated TS types yet — it reads `cms-openapi.json` directly.)

Pulling and generating are manual, on-demand steps — not part of any build — so run them whenever
the API changes. Both need a real backend running (compose handles the postgres dependency):

```bash
# start a backend
docker compose up -d postgres backend

# 1. refresh the committed specs -> generated/{user,cms}-openapi.json
cd packages/api-types && npm run pull-openapi

# 2. regenerate the TypeScript types (api.ts). web owns this script; it reads the live `user`
#    group and writes back into this package:
cd web && npm run gen:api
#    = openapi-typescript http://localhost:8080/v3/api-docs/user -o ../packages/api-types/generated/api.ts
```

See `scripts/pull-openapi.mjs` for the pull step; it discovers the configured groups from
`/v3/api-docs/swagger-config` automatically.
