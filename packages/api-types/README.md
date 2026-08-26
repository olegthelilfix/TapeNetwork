# @tape/api-types

TypeScript types generated from the backend OpenAPI schema, shared by `web` and `cms`.

Generation is wired in **stage 3**, roughly:

```bash
# backend must be running (or export the static schema)
npx openapi-typescript http://localhost:8080/v3/api-docs -o generated/api.ts
```

Until then this package is a placeholder; `web` and `cms` use hand-written types.
