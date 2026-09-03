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
| `generate-endpoints.mjs` | Pulls the live OpenAPI spec (`/v3/api-docs`), lists public GET endpoints, and reports which are covered / excluded / **uncovered**. |
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
by more than `MAX_REGRESSION`%** (default 15); throughput and per-service CPU/RAM
are shown but not gated (too noisy).

`perf/ci-run-and-record.sh` is the shared remote step (up → k6 + sample →
`compare.mjs record`), invoked once per stack — DRY, one place to change.

Both stacks are throwaway (own compose project, ports 18081–18082 / 15433–15434)
and never touch the live prod stack.

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