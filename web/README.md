# web — Tape Network public site

Next.js (App Router) server-side-rendered site. TypeScript + CSS Modules. Reads the public
backend API (`/api/v1`); no client state beyond the page.

## Run

```bash
yarn install
yarn dev                # http://localhost:3000 (expects backend on :8080)
# or via the whole stack from repo root:
docker compose up --build web
```

## Scripts

```bash
yarn dev         # dev server
yarn build       # production build (standalone output)
yarn start       # serve the production build
yarn lint        # ESLint for handwritten code
yarn typecheck   # strict TypeScript validation
yarn test        # Vitest
yarn gen:api     # regenerate the OpenAPI client → src/api
```

## Layout

```
src/
  app/                     App Router routes (all SSR, dynamic):
    page.tsx               home (hero + featured + programming/most-watched sidebar + shows + newsroom)
    shows/ , shows/[slug]
    on-demand/ , [category]/ , [category]/[subcategory]
    articles/ , articles/[slug]
    watch/[slug]           player (stub)
    search/                results
    sitemap.ts , robots.ts
    layout.tsx             header + ticker + footer + site JSON-LD
  api/                     generated OpenAPI transport client (not committed)
  services/server/http/    server-only TaskEither transport for generated controllers
  domain/                  transport-independent application entities
  features/                server-side route behaviour and orchestration
  services/server/         generated API integration, mappers and controllers
  ui/                      reusable presentational components
  lib/format.ts            legacy presentation helpers (being migrated)
  styles/tokens.css        design tokens (dark "terminal" theme, IBM Plex fonts)
```

## Conventions

- Pages are `export const dynamic = "force-dynamic"` and fetch in the server component — no
  build-time API calls. Missing/unreachable data degrades gracefully (e.g. empty ticker).
- Images: backend returns `uploads/…` or absolute URLs; `mediaUrl()` normalizes them. Seed
  images are served from `public/uploads`.
- Styling is CSS Modules using the tokens in `styles/tokens.css` — no CSS framework.
- SEO: per-page `metadata` (title/description/canonical/OpenGraph) + JSON-LD; `sitemap.ts` and
  `robots.ts` use `NEXT_PUBLIC_SITE_URL`.

## Env

- `API_BASE_URL` — backend URL used during SSR (container-to-container), default `http://localhost:8080`.
- `NEXT_PUBLIC_SITE_URL` — public origin for canonical/OG/sitemap.
