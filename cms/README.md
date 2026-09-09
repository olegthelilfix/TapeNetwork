# cms — Tape Network admin

[Refine](https://refine.dev) + Ant Design + Vite SPA. Built to static files and served by nginx.
Editors-only tool for managing content via the backend admin API (`/api/admin`).

## Run

```bash
npm ci
npm run dev            # http://localhost:5173 (expects backend on :8080)
# or via the whole stack from repo root:
docker compose up --build cms
```

Dev login: `admin@tape.local` / `password`.

## Scripts

```bash
npm run dev       # dev server
npm run lint      # architecture and code-style checks
npm run typecheck # TypeScript strict-mode check
npm test          # unit tests
npm run build     # tsc + vite build → dist/
npm run preview   # preview the production build
```

GitHub Actions executes `lint`, `typecheck`, `test`, and `build` for pushes to `main` and pull requests.

## How it works

- `src/app/refine/` — the REST client, Refine data provider, auth provider, resource registration
  and the explicit media-upload API boundary. Authentication and upload responses are validated at
  this boundary.
- `src/domain/` — framework-independent CMS entity and value types.
- `src/features/resource-management/resourceDefinitions.ts` — the typed field configuration for
  all resources (text/textarea/number/boolean/select/reference/tags/stringArray/datetime/media).
  `app/refine/resources.ts` derives Refine resource routes from it.
- `src/features/resource-list`, `resource-form`, and `media-upload` — Refine queries, mutations,
  form orchestration, and navigation. They compose reusable presentational modules from `src/ui/`.
- `src/app/App.tsx` — application composition root; `src/pages/login` and `src/pages/dashboard`
  contain route-level screens.
- `docs/current-api-contract.md` — API behaviour that refactoring must preserve.

The admin API speaks the **domain model** (has `id`, editable FK ids). To add a resource: add an
entry to `src/features/resource-management/resourceDefinitions.ts` (and the matching
`AdminFooController` on the backend).

## Env

- `VITE_ADMIN_API_URL` — admin API base, default `http://localhost:8080/api/admin` (baked in at build).
