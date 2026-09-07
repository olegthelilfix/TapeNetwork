# Backend load / performance tests (`perf/`)

Load tests for the **public** TapeNetwork API (`/api/v1`), driven with
[k6](https://k6.io/). Covers the read paths the public site hits: content
listings, detail-by-slug lookups, and full-text search (the Lucene hotspot).

> **Scope.** The admin API (`/api/admin`) is **out of scope** and is never
> called here (issue #5). There is no pagination on the public API — listings
> return plain arrays — so no page/size load profile exists; only `search` takes
> a `limit` (default 8).

## Layout

| File | What it does |
|------|--------------|
| `scenarios.js` | The k6 test: weighted mix of listings / detail-by-slug / search, per-group latency, pass/fail thresholds, HTML+JSON report. |
| `journey.js` | Full-service **user-journey** k6 test (#39): drives the real Next.js **web pages** (SSR, port 3000) with think-time, not the API directly. |
| `generate-endpoints.mjs` | Pulls the live OpenAPI spec (`/v3/api-docs`), lists public GET endpoints, and reports which are covered / excluded / **uncovered**. |
| `pages-coverage.mjs` | Scans `web/src/app` routes and reports which pages the journey covers / excludes / **misses** (frontend counterpart of the endpoint checker). |
| `sample-stats.sh` | Samples per-container CPU / memory into a CSV (via `docker stats`) while a load test runs. |
| `run.sh` | Runs k6 in Docker against a running stack and writes reports to `results/`. |
| `results/` | Generated reports (git-ignored). |

## Prerequisites

- The stack running (`docker compose up -d` / `podman compose up -d`) — backend on `:8080`.
- Docker/Podman (k6 runs in the `grafana/k6` image; no local k6 install needed).
- Node 18+ for the coverage checker (uses built-in `fetch`).

## Run a load test

```bash
cd perf
./run.sh                                   # localhost:8080, 20 VUs, 30s ramp, 1m steady
BASE_URL=http://34.13.255.70:8080 ./run.sh # against the deployed VM
VUS=50 RAMP=1m DURATION=3m ./run.sh        # heavier profile
```

All load parameters are env vars (nothing hardcoded):

| Var | Default | Meaning |
|-----|---------|---------|
| `BASE_URL` | `http://localhost:8080` | Target base URL |
| `VUS` | `20` | Peak virtual users |
| `RAMP` | `30s` | Ramp-up duration to peak |
| `DURATION` | `1m` | Steady-state duration at peak |
| `SEARCH_Q` | seed terms | Comma-list of search terms (hits) |
| `SLUGS_SHOWS` / `SLUGS_CATEGORIES` / `SLUGS_SUBCATEGORIES` | seed slugs | Comma-lists of real slugs to hit |

## Pool-pressure profile

`public_api` above never drives real Hikari-pool contention: `ShowService`,
`CatalogService`, `ScheduleService`, and `TickerService` all wrap their reads
in `@Cacheable` (Caffeine, TTL `tape.cache.public-ttl-seconds`), and
`ArticleStore`/`VideoStore` read from `CachedContentStore`, an in-memory map
populated once at startup and never re-queried per request. None of those
reach Postgres per request. `/api/v1/home` is also uncached and already part
of the default mix's listings group, but its indexed repository lookups are
lighter than a Lucene-backed search. `/api/v1/search?type=show` and
`type=episode` are the heavier lever: both open a `Search.session(em)` call
that hydrates matched rows from Postgres on every request. So an optional
`pool_pressure` scenario hammers exactly those two, at a fixed arrival rate,
to make a pool-size change (`maximum-pool-size`, `minimum-idle`, …) show up as
a measurable latency delta.

Off by default; enable with `PRESSURE=1`:

```bash
PRESSURE=1 PRESSURE_DURATION=30s ./run.sh
```

| Var | Default | Meaning |
|-----|---------|---------|
| `PRESSURE` | unset | Set to `1` to add the `pool_pressure` scenario |
| `PRESSURE_RATE` | `200` | Target requests/sec once ramped up |
| `PRESSURE_RAMP` | `15s` | Ramp-up duration to `PRESSURE_RATE` |
| `PRESSURE_DURATION` | `1m` | Steady-state duration at `PRESSURE_RATE` |
| `PRESSURE_MAX_VUS` | `300` | VU ceiling backing the arrival rate |

`pool_pressure` uses a `ramping-arrival-rate` executor (not more VUs on
`public_api`'s `ramping-vus`), so requests arrive at a fixed rate regardless of
how long each one takes. Once that rate exceeds what the pool can drain,
queueing shows up directly as latency in the new `lat_pool_pressure` `Trend`.
It starts only after `public_api`'s own stages finish (an offset computed from
`WARMUP`/`RAMP`/`DURATION`, not a hardcoded number), so the two scenarios never
overlap and neither one's numbers move because the other was retuned. Its own
ramp-up and ramp-down samples are excluded from `lat_pool_pressure` too (the
same pattern as `public_api`'s `warmup` exclusion), so the reported percentiles
reflect the `PRESSURE_RATE` steady-state window, not the transition into or
out of it.

Because `pool_pressure` pushes traffic on purpose to stress the pool, the existing
`http_req_failed`/`http_req_duration` thresholds are now tag-scoped to
`{scenario:'public_api'}`. Otherwise, a PR with nothing to do with Hikari
could turn them red just because `PRESSURE=1` is on. `lat_search`/
`lat_listing`/`lat_detail` didn't need scoping (only `public_api`'s `run()`
writes to them). `lat_pool_pressure` carries no k6 threshold in
`scenarios.js`: it's the metric a perf-compare run is meant to observe, not
a limit this k6 run enforces on its own.

That's not the whole story, though: `perf/compare.mjs`'s own per-group
pass/fail check auto-discovers every `lat_*`/`page_*` group from the k6
summary, `lat_pool_pressure` included, so leaving it alone there would still
fail the PR check on a slow pool-pressure run. `compare.mjs` explicitly
excludes `lat_pool_pressure` via its `INFORMATIONAL_GROUPS` set (the same
pattern peak CPU/memory already use): the group's p95/p99 still render in the
sticky PR comment's per-group table, marked `(info)`, but a red row there
never sets the check's exit code. See "Regression: master vs branch" below.

> **Fixed: the backend used to fail to start with these env vars set.**
> Bringing the backend up with all six `SPRING_DATASOURCE_HIKARI_*` vars set
> (exactly as `docker-compose.yml`/`.env.example` declare them) used to crash
> on boot. Spring Boot 3.4.4 threw `IllegalStateException: The configuration
> of the pool is sealed once started` while binding `spring.datasource.hikari.*`.
> Root cause: Spring Boot's default auto-configuration builds a lazy
> `HikariDataSource` first and binds Hikari properties onto it afterward; in
> this app, Flyway's own bean creation reached that DataSource early enough
> to open its first connection (sealing the pool) before the second-phase
> binding of `connection-timeout` (and, by extension, whatever came after it)
> finished. Fixed in `backend/src/main/java/net/tape/application/DataSourceConfig.java`:
> `spring.datasource.hikari.*` now binds onto a plain `HikariConfig` (never a
> live pool) before a single, fully-configured `HikariDataSource` is
> constructed from it. No window remains for an early consumer to seal the
> pool mid-bind. Confirmed fixed via a bare `./gradlew bootRun` with all six
> vars set: the pool starts under the configured name (`TapeHikariPool`),
> `/actuator/health` returns `UP`, and the full backend test suite still
> passes.
>
> **Answered (2026-09-08): `PRESSURE_RATE=200` does not saturate the pool
> locally.** Three short local runs (podman on a laptop, not a controlled
> benchmark) measured `lat_pool_pressure` p95/p99 at three arrival rates. At
> 20 req/s (control): p95 8.86ms, p99 12.79ms. At 200 req/s (the documented
> default): p95 2.69ms, p99 3.63ms. At 2000 req/s (10x the default,
> exploratory): p95 1.55ms, p99 3.16ms. Latency did not rise with rate. The
> 20 req/s run was actually the slowest of the three, so this looks like
> run-to-run noise, not queueing. These runs also showed the local default
> pool size is `maximum-pool-size=20`/`minimum-idle=10` (per
> `.env.example`/`docker-compose.yml`), not the 10-connection pool this note
> used to assume.
>
> Why: the `pool_pressure` search query averages under 2ms per request here.
> By Little's Law (roughly: the number of requests in flight at once equals
> the arrival rate multiplied by how long each request takes), saturating
> even a 10-connection pool needs an arrival rate in the thousands of
> requests per second. That's well past the
> documented default, and past the 2000 req/s run above, which still showed
> no queueing. With this seed dataset and query cost, `PRESSURE_RATE=200`/
> `PRESSURE_MAX_VUS=300` don't exercise real pool contention.
>
> This needs re-baselining. Two short laptop runs plus one exploratory run
> aren't enough to pick a new default with confidence, but they do rule out
> the current one: it produces a flat, non-saturating result, and so does a
> rate 10x higher. Before trusting a `lat_pool_pressure` delta, try one of:
> push `PRESSURE_RATE` well past 2000 (these runs don't show where it starts
> to saturate); shrink the tested pool to a few connections so a moderate
> rate can exhaust it; or add a synthetic slow path so per-request latency is
> large enough for Little's Law to make saturation reachable at a realistic
> rate.
>
> **Follow-up (2026-09-08): found a rate that saturates, and it shows the
> pool-size change working.** Stepped `PRESSURE_RATE` up from the 2000 req/s
> ceiling above, in short runs (`PRESSURE_RAMP=10s`, `PRESSURE_DURATION=20s`).
> The VU ceiling was `PRESSURE_MAX_VUS=1000` for the 5000 req/s run and `1500`
> for the 6000 and 8000 req/s runs, backend at the branch's default
> `maximum-pool-size=20`:
>
> | rate | p95 | p99 | avg |
> |---|---|---|---|
> | 2000 (prior run, for reference) | 1.55ms | 3.16ms | n/a |
> | 5000 | 6.29ms | 10.66ms | 2.26ms |
> | 6000 | 17.88ms | 26.93ms | 5.40ms |
> | 8000 | 112.43ms | 159.00ms | 33.34ms |
>
> Latency finally rises with rate, confirming the pool can be made to queue
> locally. But 6000 turned out to be a bad choice for an actual before/after
> comparison: it sits right at the *start* of the knee, the point where
> latency starts climbing sharply as the rate goes up. At that point, the
> real difference a pool-size change makes is about as big as the random
> swings between repeated runs of the exact same setup, on this machine (an
> active laptop: IDE, browser, and a second agent session running throughout,
> `uptime` load average 6-7 during these tests, not a quiet CI VM). Three
> same-config (pool=20) runs at 6000 gave `lat_pool_pressure` p95 of 17.88ms,
> 34.09ms, and 57.53ms: a spread of more than 3x with *no change to the pool
> at all*. One direct pool=10-vs-pool=20 pair at 6000 even came out backwards
> (pool=20 slower on p95). 8000 req/s was the first rate where the gap
> between pool=10 and pool=20 was clearly bigger than that run-to-run noise,
> so it's the rate used below.
>
> **Before/after at `PRESSURE_RATE=8000`** (`PRESSURE_RAMP=10s`,
> `PRESSURE_DURATION=20s`, `PRESSURE_MAX_VUS=1500`, `DURATION=20s RAMP=10s` for
> `public_api`), backend restarted between pool sizes, 3 runs per side:
>
> | pool size | run | avg | p95 | p99 | max | dropped iters | http_req_failed |
> |---|---|---|---|---|---|---|---|
> | 10 | 1 | 105.41ms | 283.25ms | 419.20ms | 4.77s | 17% | 0.07% |
> | 10 | 2 | 98.63ms  | 250.45ms | 319.09ms | 690ms | 22% | 0.03% |
> | 10 | 3 | 118.85ms | 306.67ms | 415.90ms | 816ms | 29% | 0.02% |
> | 20 (branch default) | 1 | 27.49ms | 88.17ms  | 139.65ms | 332ms | 16% | 0.12% |
> | 20 (branch default) | 2 | 35.47ms | 121.62ms | 252.54ms | 714ms | 19% | 0.03% |
> | 20 (branch default) | 3 | 33.34ms | 112.43ms | 159.00ms | 314ms | 12% | 0.05% |
>
> `SPRING_DATASOURCE_HIKARI_MAXIMUM_POOL_SIZE=10` for the "before" rows
> (HikariCP's real stock default: what `master` effectively runs, since it
> never sets this property); no override for "after" (the branch's
> `maximum-pool-size=20`). Averaged across each side's 3 runs: pool=10 lands
> at **avg ≈ 108ms / p95 ≈ 280ms / p99 ≈ 385ms**; pool=20 at **avg ≈ 32ms /
> p95 ≈ 107ms / p99 ≈ 184ms**. That's roughly 3.4x on avg, 2.6x on p95, and
> 2.1x on p99: the expected direction, and, unlike the 6000 req/s runs,
> clearly bigger than the run-to-run noise. Pool=10's *lowest* p95 (250ms) is
> still more than double pool=20's *highest* p95 (122ms), and the two sides'
> p99 ranges (319-420ms vs. 140-253ms) don't overlap.
>
> One reason to trust this result, not dismiss it as a fluke that happens to
> favor pool=20: `dropped_iterations` (how often k6's arrival-rate executor
> gave up on scheduling a request it couldn't fit in time) ran 12-29% across
> these runs, and ran *higher* on the pool=10 side. A dropped iteration never
> records a `lat_pool_pressure` sample, so the worse pool=10 got, the more
> its slowest would-be requests were silently left out of its own
> percentiles. If anything, that makes pool=10 look better than it really is,
> so the true gap is probably bigger than the numbers above show, not
> smaller. `http_req_failed` on top of that stayed under 0.15% on every run
> (a handful of client-side `dial: i/o timeout` errors each time, consistent
> with the podman-machine network stack under load, not the application), so
> these aren't failure-driven percentiles either.
>
> Limits of this test, plainly: this is a laptop running podman (not the
> target CI VM), under real background load throughout, from 6 short runs (3
> per side), not a multi-hour controlled benchmark. `PRESSURE_RATE=8000` is
> 40x the current documented default and needed `PRESSURE_MAX_VUS=1500` (5x
> the 300 default). Pool=10's runs used nearly the whole allocation
> (`vus_max` 1467-1520 out of 1500+20), so k6's own VU ceiling was close to
> becoming a second limiting factor on top of the pool itself; raising
> `PRESSURE_MAX_VUS` further would be worth checking before treating
> 8000/1500 as final. The CI VM's specs are unknown to this session, so the
> actual rate needed to saturate it there (which could be higher or lower)
> has to be found the same way: step the rate, watch for the knee, and
> confirm the before/after gap clearly beats the run-to-run noise. Don't
> assume it's 8000 there too.
>
> Recommendation (for the user to decide, not applied here): the current
> `PRESSURE_RATE=200` / `PRESSURE_MAX_VUS=300` defaults in `scenarios.js` and
> `perf-compare.yml` do not put real pressure on the pool and would not catch
> a Hikari-pool regression. Every `perf`-labeled PR currently gets a
> `lat_pool_pressure` row that can't move. If the goal is for that row to
> mean something, raising both substantially is worth doing (this session's
> results point to somewhere in the 6000-8000+ req/s / 1000-1500+ VU range as
> a starting point to re-verify on the actual CI VM). The tradeoff:
> `perf-compare.yml` already roughly doubles per-leg wall time with
> `PRESSURE=1` on, and a much higher rate adds real CPU and network load to
> the CI runner on top of that, so it's worth confirming the CI VM can
> generate and absorb that rate before locking it in.

## Check OpenAPI coverage

Ensures new public endpoints don't silently escape the load test:

```bash
node generate-endpoints.mjs                # print coverage report
node generate-endpoints.mjs --fail-on-gap  # exit 1 if any public GET is uncovered
node generate-endpoints.mjs --write        # also dump covered.json
```

If it lists an **UNCOVERED** endpoint, either add it to the scenario mix in
`scenarios.js` and to the `COVERED` list, or add it to `EXCLUDED` with a reason.

## Interpreting the output

`run.sh` writes to `perf/results/`:

- **`summary.html`** — open in a browser; shareable. Charts of request rate and
  latency distribution.
- **`summary.json`** — machine-readable full summary (throughput, percentiles).

k6 also prints a console summary and **exits non-zero if any threshold fails** —
so this doubles as a CI gate. The thresholds (in `scenarios.js`):

| Metric | Budget |
|--------|--------|
| `http_req_failed` | error rate < 1% |
| `http_req_duration` | p95 < 400ms, p99 < 800ms |
| `lat_search` (search only) | p95 < 600ms, p99 < 1200ms |
| `lat_listing` / `lat_detail` | p95 < 300ms |

Key numbers to read: **`http_reqs`** (throughput / RPS), **`http_req_duration`**
p95/p99 (overall latency), and **`lat_search`** p95/p99 (the search hotspot in
isolation). A green run means every budget held at the configured load; tune the
budgets in `scenarios.js` to your target SLOs.

> Thresholds are starting points sized for the small seed dataset on a modest
> VM. Re-baseline them against your target instance before treating a red run as
> a real regression.

> The `http_req_failed`/`http_req_duration` rows above are scoped to the
> `public_api` scenario (see "Pool-pressure profile" above) so an optional
> `PRESSURE=1` run doesn't fail them on its own deliberately-heavy traffic.

## CI: run against an ephemeral isolated stack

`.github/workflows/perf.yml` (manual, **Actions → Load test (k6, on VM) → Run
workflow**) runs the suite for a chosen branch against a **throwaway** stack — it
does NOT touch the live prod stack:

1. ships the branch source to the build VM;
2. brings up an isolated compose stack (own project name, non-default ports
   `18080`/`15432`) — only `backend` + its `postgres`;
3. waits for `/api/v1/health`, then runs k6 while `sample-stats.sh` records
   per-container CPU/MEM in the background;
4. uploads the reports as a run artifact;
5. tears the stack down (`docker compose down -v`) **always**, even on failure —
   no lingering containers or volumes.

Inputs: `ref` (branch/tag/SHA), `vus`, `ramp`, `duration`.

> A threshold breach does **not** fail the workflow — the report is the
> deliverable and the k6 exit code is logged. Read the artifact to judge.

## Resource metrics (CPU / memory per service)

`sample-stats.sh <out.csv> [interval] [project]` snapshots `docker stats` on an
interval into a CSV — the "how did the system behave under load" half of the
report, alongside k6's "how much load was applied" half. Columns:

```
ts,container,cpu_pct,mem_used,mem_limit,mem_pct,net_io,block_io
```

The CI workflow runs it automatically (filtered to the perf project) and includes
`stats.csv` in the artifact. To sample a local run manually:

```bash
./sample-stats.sh results/stats.csv 2 &        # sample every 2s
SAMPLER=$!
./run.sh
kill $SAMPLER
```

Correlate the CSV timestamps with the k6 run window to see which service (and how
much RAM/CPU) each rendition of load cost — the starting point for capacity
decisions (issue #30).

## Regression: master vs branch, both reports in the PR

`.github/workflows/perf-compare.yml` (triggered by the **`perf`** label on a PR)
does the whole thing in **one run**:

1. brings up an isolated **master** stack, load-tests it, records `master`;
2. brings up an isolated **branch** stack, load-tests it, records `branch`;
3. diffs the two with `compare.mjs` and posts a **sticky PR comment** with the
   delta table;
4. uploads **both HTML reports + both CSVs + the comparison** as a single
   `perf-report-*` artifact on the run;
5. tears both stacks down (`down -v`) in an always-step.

Running master and branch back-to-back on the same VM keeps conditions identical
(low noise) and means there's no separate baseline artifact to manage — both
reports live on the PR. The check goes **red if latency or error rate regressed
by more than `MAX_REGRESSION`%** (default 15); throughput, per-service CPU/RAM,
and `lat_pool_pressure` are shown in the comment but not gated (see "Pool-pressure
profile" above for why that one group is deliberately excluded from the
per-group pass/fail check).

`perf/ci-run-and-record.sh` is the shared remote step (up → k6 + sample →
`compare.mjs record`), invoked once per stack — DRY, one place to change.

Both stacks are throwaway (own compose project, ports 18081–18082 / 15433–15434)
and never touch the live prod stack.

**`PRESSURE=1` is always on for this workflow** (job-level `env:`),
so every `perf`-labeled PR's comment carries a `lat_pool_pressure` row. That
requires one deliberate exception to "master's tree, branch's tree": `perf/`
itself is packaged from **`head-src` for both legs**, while `backend`/`web`/
`cms`/`streamer`/`docker-compose.yml` still come from each leg's own checkout
(`base-src` for master, `head-src` for the branch), unchanged. Reason: master's
own `perf/scenarios.js` predates the `PRESSURE`/`pool_pressure` code, so a base
leg built from `base-src/perf` would run a script that never adds the
`pool_pressure` scenario at all. The sticky comment's base-side
`lat_pool_pressure` cell would read `n/a` unconditionally, regardless of
whether the Hikari change helped. Holding `perf/` constant across both legs
makes the Hikari config the only variable under test; this is safe only
because this kind of change adds no public endpoint the master backend lacks,
so the (branch-versioned) k6 script still finds everything it calls when run
against the (master-versioned) backend.

Turning `PRESSURE=1` on by default roughly doubles each leg's k6 wall time
(about 120s to about 205s at the defaults: `public_api`'s own WARMUP + RAMP +
DURATION + ramp-down already sums to ~120s, and `pool_pressure` adds
`PRESSURE_RAMP` + `PRESSURE_DURATION` + its own 10s ramp-down after that), across
4 legs, for every future `perf`-labeled PR.

### Record / compare manually

```bash
# distill a finished run into a comparable record
node compare.mjs record --k6 results/summary.json --stats results/stats.csv \
  --label master --ref "$(git rev-parse HEAD)" --out base.json

# diff two records; exits 1 on regression > 15%
node compare.mjs compare --base base.json --head head.json --max-regression 15 --md report.md
```

> **Noise.** Even back-to-back on the same burstable VM, treat sub-~15% deltas as
> noise, not signal — that's why the gate threshold defaults to 15%.

## Full-service user-journey suite (`journey.js`, #39)

Where `scenarios.js` hits the backend API directly, `journey.js` drives the
**real web frontend** (Next.js SSR pages on port 3000) along a plausible visitor
path with think-time: home → shows → a show → on-demand → category → subcategory
→ watch an episode → search → articles. Page latency then reflects the whole
chain a user feels — SSR render + the web→backend fetch + the HTML document.

Run it via the shared harness by setting `SUITE=journey`:

```bash
# manual workflow: Actions → Load test (k6, on VM) → suite = journey
# locally against a running stack (web on :3000):
SUITE=journey WEB_URL=http://localhost:3000 docker run --rm \
  --add-host=host.docker.internal:host-gateway -v "$PWD:/perf" -w /perf \
  -e WEB_URL -e VUS -e RAMP -e DURATION -e THINK_MIN -e THINK_MAX \
  grafana/k6 run journey.js
```

Extra env: `THINK_MIN`/`THINK_MAX` (seconds of think-time between steps, default
1..3), `SLUGS_WATCH` (episode slugs for the watch step). Thresholds are per
journey-step (`page_home`, `page_listing`, `page_detail`, `page_search`,
`page_watch`) and sized higher than the API suite — SSR with `force-dynamic`
re-renders every request, so page loads are hundreds of ms, not tens.

Check page coverage against the app's real routes:

```bash
node pages-coverage.mjs --fail-on-gap   # exit 1 if a public page isn't journeyed
```

### In CI

- **`perf.yml`** takes a `suite` input (`scenarios` | `journey`).
- **`perf-compare.yml`** runs the API suite on the `perf` label and the
  user-journey suite on the **`perf-journey`** label. The `journey` suite brings
  up `web` + `backend` + `postgres` (not backend alone), so runs are heavier and
  slower than the API suite.

> Complements, does not replace, the API suite (#5): the API suite isolates
> backend latency; the journey suite measures the whole service as a user hits
> it.

## Reducing noise: warm-up + path priming

Cold JVM (no JIT), empty Caffeine/Lucene, cold Next SSR make the first requests
much slower and inflate p95/p99. Two cheap mitigations run before every measured
window:

1. **Path priming** (`ci-run-and-record.sh`): after the stack is healthy, each
   endpoint/page is curled a few times so the first *measured* request isn't a
   cold-start outlier.
2. **k6 warm-up scenario** (`scenarios.js` / `journey.js`): a short low-load
   `warmup` scenario runs first; the measured scenario starts only after it
   (`startTime: WARMUP`). Warm-up requests are **excluded from the gated
   `lat_*` / `page_*` trends** (see `get()` / `page()`), so cold-start latency
   never counts against the thresholds. Tune with `WARMUP` (default `20s`).

What this does NOT fix: burstable-CPU jitter on the shared VM — for that, raise
`DURATION` or move to a dedicated instance (#30). Sub-~15% deltas are still
noise; that's why the regression gate defaults to 15%.

## Cancelling position bias: 4 runs, median

Running base then head once each gives whichever leg runs **second** a warmed VM
and warm docker cache, so it looks spuriously faster — a directional bias, not
random noise (untouched groups showed a steady ~-30%). `perf-compare.yml` runs
each leg **twice in the symmetric order base, head, head, base** and
`compare.mjs` takes the **per-metric median** of each leg's runs
(`--base a.json --base b.json --head c.json --head d.json`). The second-place
advantage now lands on both legs equally and cancels out; a real regression
(e.g. search) survives the median. Cost: 4 stack bring-ups instead of 2.