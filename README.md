# Tape Network

Free (no paywall, no viewer accounts) financial video-streaming site — live shows, on-demand
catalog and written analysis. Built from the design-canvas prototype in [`prototype/`](prototype).

> **v1 scope:** video playback is a preview stub (no streaming stack yet); the market ticker is
> seed/mock data managed via the CMS; the newsletter signup is decorative; English only. See the
> [task board](#task-board) for what's real vs planned.

## Architecture

```
                    ┌─────────────┐
   Postgres ───────▶│   backend   │  Java 21 · Spring Boot · Gradle
                    │  (REST API) │  public /api/v1  ·  admin /api/admin
                    └──────┬──────┘  full-text search (Hibernate Search/Lucene) · JWT auth
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
       ┌────────────┐            ┌────────────┐
       │    web     │            │    cms     │
       │ Next.js SSR│            │  Refine    │  (static, editors only)
       └────────────┘            └────────────┘
```

| Service  | Stack                                        | Port  |
|----------|----------------------------------------------|-------|
| postgres | PostgreSQL 16                                | 5432  |
| backend  | Java 21, Spring Boot 3, Gradle, Flyway       | 8080  |
| web      | Next.js (App Router), CSS Modules            | 3000  |
| cms      | Refine + Vite → nginx static                 | 5173  |

Public API: `http://localhost:8080/api/v1` · Admin API: `http://localhost:8080/api/admin`
OpenAPI / Swagger UI: `http://localhost:8080/swagger-ui.html`

## Quick start

Needs Docker **or** Podman (with the compose provider):

```bash
cp .env.example .env
docker compose up --build      # or: podman compose up --build
```

Then open:
- Site — http://localhost:3000
- CMS  — http://localhost:5173  (dev login: `admin@tape.local` / `password`)
- API health — http://localhost:8080/api/v1/health

Stop: `docker compose down` (add `-v` to also wipe the database volume).

> First page load can be slow while Next.js optimizes the large seed images; subsequent loads are cached.

## Repo layout

```
backend/            Spring Boot API — layered (orm / model / api / service / application). See backend/README.md
web/                Next.js public site (SSR). See web/README.md
cms/                Refine admin SPA (static). See cms/README.md
packages/api-types/ TypeScript types generated from the backend OpenAPI schema
tasks/              Markdown task board (one .md per task) + generated board.html
tools/task-mcp/     Task-board CLI + MCP server. See tools/task-mcp/README.md
prototype/          Original design-canvas prototype (.dc.html) — reference
.github/workflows/  CI (backend tests + web/cms builds)
```

## Testing

```bash
cd backend && ./gradlew build     # compile + JUnit unit tests
cd web && npm test              # vitest
```

CI (`.github/workflows/ci.yml`) runs backend tests and builds web & cms on every push/PR.

## SEO

Per-page canonical URLs, OpenGraph tags + images, JSON-LD (WebSite/Organization site-wide,
NewsArticle on articles, VideoObject on the player), `sitemap.xml` and `robots.txt`.
Set `NEXT_PUBLIC_SITE_URL` to the real domain so canonical/OG/sitemap use absolute URLs.

## Task board

A tiny markdown "mini-Jira" lives in `tasks/` — one file per task, swimlanes for the dev
lifecycle. Look at it without any server:

```bash
node tools/task-mcp/cli.mjs board          # in the terminal
node tools/task-mcp/cli.mjs board --html   # open tasks/board.html in a browser
```

It also exposes an MCP server so AI agents can query/update tasks. See [tools/task-mcp/README.md](tools/task-mcp/README.md).

## Working with AI agents

[`CLAUDE.md`](CLAUDE.md) documents the architecture conventions, invariants and "how to add a
feature" flow for AI agents (and is a good orientation for humans too).

## Decisions (v1)

- Video: stub/link only (no own streaming stack yet).
- Market ticker: mock/seed data managed via the CMS (not real-time).
- Newsletter signup: decorative stub (emails not stored).
- Accounts: editors/admins only (CMS). No public user accounts.
- Search: Hibernate Search (Lucene backend) over shows/videos/episodes/articles.
- Backend: layered packages + 3-tier objects (Entity ↔ Model ↔ DTO) with MapStruct.
- English only.
