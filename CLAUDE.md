# CLAUDE.md

Guidance for AI agents (and humans) working in this repo. Keep it accurate — update it when conventions change.

## What this is

**Tape Network** — a free (no paywall, no viewer accounts) financial video-streaming site, built from a design-canvas prototype (`prototype/`). Three deployables + Postgres:

- `backend/` — Java 21 / Spring Boot 3 / Maven. Owns data + REST API (public `/api/v1`, admin `/api/admin`), full-text search, auth, media upload.
- `web/` — Next.js (App Router) SSR public site. CSS Modules. Talks to `/api/v1`.
- `cms/` — Refine + Vite SPA (served as static). Editors only. Talks to `/api/admin`.
- `tasks/` + `tools/task-mcp/` — markdown task board (this repo's mini-Jira) with a CLI and an MCP server. See below.

## AI commit policy (read first)

After any request that changes tracked files, **commit the result before ending the turn** — one
logical commit, a message describing what was done, and AI-authorship trailers. Full rule:
[`.kiro/steering/ai-commit-policy.md`](.kiro/steering/ai-commit-policy.md). Read-only requests
produce no commit; never commit `.env`/build output; don't push to `main` or open a PR unless asked.

## Run / build / test

Whole stack (Docker **or** Podman — this machine uses `podman compose`, which shells out to `docker-compose`):

```bash
cp .env.example .env
podman compose up --build        # or: docker compose up --build
```

Ports: web `:3000`, cms `:5173`, backend `:8080` (Swagger `/swagger-ui.html`), postgres `:5432`.
Dev admin login (CMS): `admin@tape.local` / `password`.

Per module:
```bash
cd backend && mvn -B verify      # compile + unit tests
cd web && npm ci && npm test && npm run build
cd cms && npm ci && npm run build
```
CI mirrors these (`.github/workflows/ci.yml`).

## Backend architecture — LAYERED, 3-tier objects

Packages under `net.tape` (do NOT go back to package-by-feature):

| package | holds |
|---|---|
| `orm` | JPA `*Entity` + Spring Data repositories (DB access) |
| `model` | framework-free domain POJOs (`Article`, `Show`, …) |
| `api` | controllers + public `*DtoV1` records + `PagedResponse`, `SearchHit`, `ApiExceptionHandler` |
| `service` | services (business logic) + **MapStruct** mappers + `Format`, `MediaResolver`, `NotFoundException` |
| `application` | `SecurityConfig`/`OpenApiConfig`/`WebConfig`, `JwtService`/`JwtAuthFilter`, `SearchIndexInitializer` |

`TapeApplication` **stays at the root `net.tape`** so Spring component/entity/repository auto-scan covers every layer.

Object flow: **Entity ↔ Model ↔ DTO**.
- Public API returns versioned `*DtoV1` **without `id`** (the outside world addresses things by `slug`).
- Admin API returns/accepts the **domain model** (has `id`, editable FK ids, resolved names).
- Mapping is **MapStruct 1.6.3** (`componentModel = "spring"`). Same-named fields map automatically; declare only derived ones. Use an **abstract-class** mapper when it needs `MediaResolver` (inject via `@Autowired protected`); compute derived fields with `@Mapping(expression = "java(...)")` (e.g. `Format.duration`) and association names with `source = "show.name"`.

### Adding a new content type `Foo`
1. `orm/FooEntity` (`@Entity`; new table via a Flyway migration) + `FooRepository`.
2. `model/Foo` (POJO).
3. `api/FooDtoV1` (public record — no `id`).
4. `service/FooMapper` (`@Mapper(componentModel="spring")`): `toModel(FooEntity)`, `toDtoV1(Foo)`, `applyToEntity(Foo, @MappingTarget FooEntity)`.
5. `service/FooService` returns domain models.
6. `api/FooController` maps model → `FooDtoV1`.
7. Admin: add an `AdminFooController` subclass of `AbstractCrudController<FooEntity, Foo>` in `api/AdminControllers.java`; register the resource + fields in `cms/src/fields.ts`.

## Invariants / gotchas (don't relearn these the hard way)

- **Flyway owns the schema.** `spring.jpa.hibernate.ddl-auto=none`. Migrations are **forward-only** — never edit an applied `V*.sql`; add a new `V<n>__*.sql`.
- **Postgres `text[]` arrays → map as `String[]`**, not `List<String>`. With a JSON format-mapper on the classpath Hibernate reads `List<String>` as JSON and chokes on the `{a,b}` array literal. (jsonb → `List<String>` via `@JdbcTypeCode(SqlTypes.JSON)` is fine — that's how `article.body` works.)
- Entities model FKs as a **read-only `@ManyToOne`** (`@JsonIgnore`, `insertable=false, updatable=false`) **plus a writable scalar `*Id` column**. Public services traverse the association inside `@Transactional`; admin/mappers write the scalar id.
- Admin CRUD reads run `@Transactional(readOnly=true)` because mappers touch lazy associations.
- **Search**: Hibernate Search (Lucene). `@Indexed` on `ShowEntity`/`EpisodeEntity`/`VideoEntity`/`ArticleEntity`; `SearchIndexInitializer` mass-indexes seeded rows at startup (Flyway seeds bypass ORM events). `SearchHit` is a flat cross-entity result — the one place we don't use the 3-tier.
- **Media**: uploads go to `tape.media.dir`, served at `/uploads/**`; seed images are stored as relative `uploads/…` (the web resolves them to `/uploads/…`).
- **Frontends** consume field *names*, not ids — keep public DTO field names stable when refactoring.

## Video / live / ticker are v1 stubs

No real streaming (player is a preview), the ticker is seed/mock data managed via the CMS, newsletter signup is decorative (emails not stored), English only. These are deliberate v1 scope, tracked in the task board.

## Task board (this repo's tracker)

Markdown tasks in `tasks/*.md` (swimlanes: `backlog → ready-for-development → in-development → in-review → ready-for-qa → testing → ready-to-deploy → deployed`).

```bash
node tools/task-mcp/cli.mjs board          # terminal board
node tools/task-mcp/cli.mjs board --html   # tasks/board.html
node tools/task-mcp/cli.mjs show TASK-001
```
An MCP server (`tools/task-mcp/server.mjs`, registered in `.mcp.json` as `tasks`) exposes `board/list_tasks/get_task/create_task/update_task/move_task/add_note`. Note: `.mcp.json` loads at Claude Code session start — in the session where it was created, drive the board via the CLI instead. Keep the board updated as work moves.
