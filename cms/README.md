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
npm run build     # tsc + vite build → dist/
npm run preview   # preview the production build
```

## How it works

- `src/dataProvider.ts` — `@refinedev/simple-rest` over an axios instance that injects the JWT
  from `localStorage`. The backend admin CRUD is simple-rest compatible (`_start/_end/_sort/_order`,
  `X-Total-Count`).
- `src/authProvider.ts` — login (`POST /auth/login`), logout, token check, identity/permissions.
- `src/fields.ts` — **the config that drives everything**: one entry per resource with its fields
  (type: text/textarea/number/boolean/select/reference/tags/stringArray/datetime/media). `resources.ts`
  derives the Refine resources from it.
- `src/components/GenericList.tsx` / `GenericForm.tsx` — render tables and create/edit forms from
  the field config. `MediaUploadField.tsx` uploads to `/api/admin/media/upload` and stores the id.
- `src/App.tsx` — Refine + router + auth-gated layout; `src/pages/Login.tsx`, `Dashboard.tsx`.

The admin API speaks the **domain model** (has `id`, editable FK ids). To add a resource: add an
entry to `src/fields.ts` (and the matching `AdminFooController` on the backend).

## Env

- `VITE_ADMIN_API_URL` — admin API base, default `http://localhost:8080/api/admin` (baked in at build).
