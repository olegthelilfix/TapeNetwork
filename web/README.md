# web — Tape Network public site

Next.js (App Router) server-side-rendered site. TypeScript + CSS Modules. Reads the public
backend API (`/api/v1`); no client state beyond the page.

## Run

```bash
npm ci
npm run dev            # http://localhost:3000 (expects backend on :8080)
# or via the whole stack from repo root:
docker compose up --build web
```

## Scripts

```bash
npm run dev      # dev server
npm run build    # production build (standalone output)
npm start        # serve the production build
npm test         # vitest (src/lib/*.test.ts)
npm run gen:api  # regenerate TS types from the running backend's OpenAPI → packages/api-types
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
  components/              Header, Brand, Ticker, Footer, Card, Section, …
  lib/
    api/client.ts          typed fetch client for /api/v1
    api/types.ts           hand-written types mirroring the backend DTOs (interim; see gen:api)
    format.ts              mediaUrl(), formatDate() (unit-tested)
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
- `NEXT_PUBLIC_API_BASE_URL` — backend URL used in the browser.
- `NEXT_PUBLIC_SITE_URL` — public origin for canonical/OG/sitemap.
