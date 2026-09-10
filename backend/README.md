# backend — Tape Network API

Java 21 · Spring Boot 3 · Gradle · PostgreSQL · Flyway · Hibernate Search (Lucene) · MapStruct · JWT.

Serves the **public** content API (`/api/v1`) and the **admin** CMS API (`/api/admin`).

## Run

```bash
# from repo root, whole stack:
docker compose up --build backend      # or: podman compose up --build backend

# standalone (needs a Postgres on :5432 matching .env):
./gradlew bootRun
```

Swagger UI: http://localhost:8080/swagger-ui.html · OpenAPI JSON: `/v3/api-docs`.

## Test

```bash
./gradlew build
```

If your default `java` is newer than 21 (e.g. 24/25), Gradle 8.14's embedded Kotlin
script compiler can fail parsing `build.gradle.kts` with a bare `IllegalArgumentException: 25`.
Pin `JAVA_HOME` for the invocation instead of changing your global default:

```bash
JAVA_HOME=$(/usr/libexec/java_home -v 21) ./gradlew build   # macOS
JAVA_HOME=/usr/lib/jvm/java-21-openjdk ./gradlew build       # Linux (path varies by distro)
```
```powershell
$env:JAVA_HOME="C:\Program Files\Zulu\zulu-21"; .\gradlew.bat build   # Windows
```

## Architecture — layered, 3-tier objects

Packages under `net.tape`:

| package | responsibility |
|---|---|
| `orm` | JPA `*Entity` classes + Spring Data repositories (all DB access) |
| `model` | framework-free domain POJOs (`Article`, `Show`, …) |
| `api` | REST controllers, public `*DtoV1` records, `PagedResponse`, `SearchHit`, `ApiExceptionHandler` |
| `service` | services (business logic) + MapStruct mappers + `Format`, `MediaResolver`, `NotFoundException` |
| `application` | security & web config, `JwtService`/`JwtAuthFilter`, `SearchIndexInitializer` |

`TapeApplication` is at the root `net.tape` so Spring's component/entity/repository scanning
covers every layer — **keep it there**.

**Object flow: Entity ↔ Model ↔ DTO.**
- Public endpoints return versioned `*DtoV1` records that **omit `id`** (resources are addressed by `slug`).
- Admin endpoints return/accept the **domain model** (has `id`, editable FK ids, resolved names/urls).
- Mapping is [MapStruct](https://mapstruct.org) (`componentModel = "spring"`). Same-named fields
  map automatically; only derived fields are declared. Mappers that need `MediaResolver` are
  abstract classes injecting it; derived values use `@Mapping(expression = "java(...)")` and
  association fields use `source = "show.name"`.

### API surface

Public (`/api/v1`): `home`, `shows`, `shows/{slug}`, `on-demand/categories[/ {slug}]`,
`on-demand/subcategories/{slug}`, `on-demand/videos/{slug}`, `articles` (paged, `?category=`),
`articles/{slug}`, `watch/{slug}`, `schedule`, `ticker`, `search?q=&type=`, `sitemap-data`.

Admin (`/api/admin`, JWT required except `auth/login`): `auth/login`, generic CRUD for
`shows, hosts, episodes, categories, subcategories, videos, authors, articles, schedule,
ticker, home-blocks, media`, and `media/upload` (multipart).

## Adding a content type `Foo`

1. `orm/FooEntity` (`@Entity`; add its table in a new Flyway migration) + `FooRepository`.
2. `model/Foo` (POJO).
3. `api/FooDtoV1` (public record, no `id`).
4. `service/FooMapper` — `toModel(FooEntity)`, `toDtoV1(Foo)`, `applyToEntity(Foo, @MappingTarget FooEntity)`.
5. `service/FooService` returning domain models.
6. `api/FooController` mapping model → `FooDtoV1`.
7. Add an `AdminFooController extends AbstractCrudController<FooEntity, Foo>` in `api/AdminControllers.java`,
   and register the resource in `cms/src/fields.ts`.

## Database & migrations

Flyway is the **single source of truth** for the schema (`spring.jpa.hibernate.ddl-auto=none`).
Migrations live in `src/main/resources/db/migration` and are **forward-only** — never edit an
applied `V*.sql`; add a new one.

- `V1__init.sql` — schema (+ Postgres full-text `tsvector` columns).
- `V2__seed.sql` — content seeded from the prototype (regenerate via `scratchpad` gen script if needed).
- `V3__fix_admin_password.sql` — sets the dev admin password to `password` (change in real envs).

Mapping notes: Postgres `text[]` columns map to Java **`String[]`** (not `List<String>`);
`jsonb` maps to `List<String>` via `@JdbcTypeCode(SqlTypes.JSON)`. FKs are a read-only
`@ManyToOne` (`@JsonIgnore`) plus a writable scalar `*Id` column.

## Search

Hibernate Search with the Lucene backend. `@Indexed` on `ShowEntity`, `EpisodeEntity`,
`VideoEntity`, `ArticleEntity`. Flyway seeds bypass ORM events, so `SearchIndexInitializer`
mass-indexes at startup (toggle with `tape.search.reindex-on-startup`). CMS edits are indexed
automatically. Index files live under `SEARCH_INDEX_DIR`.

## Auth

`POST /api/admin/auth/login` → JWT (`JwtService`). `JwtAuthFilter` validates the `Authorization:
Bearer` header on `/api/admin/**` (except login) and sets a `ROLE_<role>` authority. Dev admin
is seeded (`admin@tape.local` / `password`).

## Media

Uploads (`POST /api/admin/media/upload`) are stored under `tape.media.dir` and served at
`/uploads/**` (`WebConfig`). Seed images are referenced as relative `uploads/…` paths.

## Cache

Public read endpoints are cached with Spring Cache (`@Cacheable` in the service layer,
`@EvictsPublicContent` — a global `@CacheEvict(allEntries=true)` — on admin writes). The
backend is **embedded Hazelcast** (`CacheConfig`): it runs a Hazelcast member inside the JVM,
so both the cached entries and the write-triggered eviction are **cluster-wide**. With several
backend instances joined into one Hazelcast cluster, an admin write on any instance invalidates
the entry on every other instance — the per-JVM staleness a local cache would have.

By default it runs as a **single member with no extra infra** (multicast is always disabled).
To run multiple backend instances as one cache cluster, point each at its peers via
`HAZELCAST_MEMBERS` (see below); TCP/IP discovery turns on only when that list is non-empty.
Cached model types (`net.tape.model.*`) implement `Serializable` because Hazelcast serializes
cache values.

- `PUBLIC_CACHE_TTL_SECONDS` (default `600`) — per-map time-to-live; `0` = never expire by
  time, invalidate only on writes.
- `HAZELCAST_CLUSTER_NAME` (default `tape-public-cache`) — members only join peers sharing it.
- `HAZELCAST_PORT` (default `5701`) — member port (auto-increments if taken).
- `HAZELCAST_MEMBERS` (default empty = single member) — comma-separated peer `host[:port]`
  list, e.g. `backend-a:5701,backend-b:5701`.

## Config (env)

`SPRING_DATASOURCE_URL/USERNAME/PASSWORD`, `JWT_SECRET`, `CORS_ALLOWED_ORIGINS`,
`SEARCH_INDEX_DIR`, `MEDIA_DIR`, `SEARCH_REINDEX_ON_STARTUP`,
`PUBLIC_CACHE_TTL_SECONDS`, `HAZELCAST_CLUSTER_NAME`, `HAZELCAST_PORT`, `HAZELCAST_MEMBERS`
(see [Cache](#cache)). Defaults suit local dev; see
`src/main/resources/application.yml` and the repo-root `.env.example`.
