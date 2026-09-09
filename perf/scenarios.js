// Load/perf test for the TapeNetwork PUBLIC API (/api/v1) — issue #5.
// Admin API (/api/admin) is intentionally NOT exercised here.
//
// Load profile is parameterised via env vars (see README):
//   BASE_URL   default http://localhost:8080
//   VUS        peak virtual users            (default 20)
//   RAMP       ramp-up duration to peak       (default 30s)
//   DURATION   steady-state at peak           (default 1m)
//   SEARCH_Q   comma-list of search terms with hits
//   SLUGS_*    comma-lists of real seed slugs (see defaults below)
//
// Optional pool-pressure profile, off by default:
//   PRESSURE           set to '1' to add the pool_pressure scenario
//   PRESSURE_RATE      target requests/sec         (default 200)
//   PRESSURE_RAMP      ramp-up to that rate        (default 15s)
//   PRESSURE_DURATION  steady-state at that rate    (default 1m)
//   PRESSURE_MAX_VUS   ceiling on VUs for the rate  (default 300)
//
// Thresholds fail the run (k6 exits non-zero) if latency/error budgets are blown.
import http from 'k6/http';
import { check, group } from 'k6';
import exec from 'k6/execution';
import { Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const BASE = __ENV.BASE_URL || 'http://localhost:8080';
const API = `${BASE}/api/v1`;

// ---- parameterised test data (real seed slugs / terms; override via env) ----
function list(name, fallback) {
  const raw = __ENV[name];
  return (raw ? raw.split(',') : fallback).map((s) => s.trim()).filter(Boolean);
}
const SHOW_SLUGS = new SharedArray('shows', () =>
  list('SLUGS_SHOWS', ['the-opening-bell', 'the-vol-desk', 'chart-session']));
const CATEGORY_SLUGS = new SharedArray('categories', () =>
  list('SLUGS_CATEGORIES', ['earnings', 'macro-rates', 'options-volatility', 'technicals-flow']));
const SUBCATEGORY_SLUGS = new SharedArray('subcategories', () =>
  list('SLUGS_SUBCATEGORIES', ['macro-rates-fed', 'earnings-semis', 'options-volatility-skew']));
const SEARCH_TERMS = new SharedArray('search', () =>
  list('SEARCH_Q', ['EURUSD', 'Earnings', 'macro', 'options', 'volatility']));

// per-endpoint-group latency, so search (the Lucene hotspot) is visible separately
const tListing = new Trend('lat_listing', true);
const tDetail = new Trend('lat_detail', true);
const tSearch = new Trend('lat_search', true);
// Separate from tSearch: this only measures the optional pool_pressure
// scenario, so a pool-tuning comparison isn't diluted by public_api's own
// (much lighter) search traffic.
const tPoolPressure = new Trend('lat_pool_pressure', true);

const VUS = Number(__ENV.VUS || 20);
const RAMP = __ENV.RAMP || '30s';
const DURATION = __ENV.DURATION || '1m';
const WARMUP = __ENV.WARMUP || '20s';   // warm-up duration (metrics discarded)

// Pool-pressure profile: off unless PRESSURE='1'. Everything else
// here has a default so a bare `PRESSURE=1 ./run.sh` works without tuning.
const PRESSURE = __ENV.PRESSURE === '1';
const PRESSURE_RATE = Number(__ENV.PRESSURE_RATE || 200);
const PRESSURE_RAMP = __ENV.PRESSURE_RAMP || '15s';
const PRESSURE_DURATION = __ENV.PRESSURE_DURATION || '1m';
const PRESSURE_MAX_VUS = Number(__ENV.PRESSURE_MAX_VUS || 300);

// Parses a k6 duration string ('30s', '1m', '1m30s') into milliseconds, so
// afterPublicApi() below tracks whatever WARMUP/RAMP/DURATION are overridden
// to, instead of a hardcoded offset that goes stale the moment one changes.
function parseDurationMs(duration) {
  const msPerUnit = { ms: 1, s: 1000, m: 60_000, h: 3_600_000 };
  let totalMs = 0;
  for (const [, amount, unit] of duration.matchAll(/(\d+(?:\.\d+)?)(ms|s|m|h)/g)) {
    totalMs += parseFloat(amount) * msPerUnit[unit];
  }
  return totalMs;
}

// Shared by public_api's final stage and afterPublicApi()'s offset below, so
// changing one can't silently desync from the other and reopen the overlap
// this whole offset calculation exists to prevent.
const RAMP_DOWN = '10s';

// public_api runs WARMUP, then RAMP + DURATION + RAMP_DOWN. pool_pressure
// starts right after that finishes, so the two scenarios never overlap and
// neither one's numbers move because the other was retuned.
function afterPublicApi() {
  const totalMs = parseDurationMs(WARMUP) + parseDurationMs(RAMP) + parseDurationMs(DURATION)
    + parseDurationMs(RAMP_DOWN);
  return `${totalMs}ms`;
}

export const options = {
  // Make p99 available in the summary (k6 defaults omit it).
  summaryTrendStats: ['avg', 'min', 'med', 'p(95)', 'p(99)', 'max'],
  scenarios: {
    // Warm-up: prime JIT / Hibernate / Caffeine before measuring. Its requests
    // are NOT recorded into the gated lat_* trends (see get()), so cold-start
    // latency doesn't pollute the thresholds.
    warmup: {
      executor: 'constant-vus',
      vus: 3,
      duration: WARMUP,
      exec: 'run',
      tags: { phase: 'warmup' },
    },
    public_api: {
      executor: 'ramping-vus',
      startVUs: 1,
      startTime: WARMUP,             // begin only after warm-up finishes
      exec: 'run',
      stages: [
        { duration: RAMP, target: VUS },
        { duration: DURATION, target: VUS },
        { duration: RAMP_DOWN, target: 0 },
      ],
    },
  },
  thresholds: {
    // Tag-scoped to public_api: once PRESSURE=1 runs pool_pressure alongside
    // it, that scenario's on-purpose heavy traffic would otherwise
    // feed these same global metrics and could turn them red for PRs that
    // have nothing to do with Hikari (see perf/README.md).
    'http_req_failed{scenario:public_api}': ['rate<0.01'],
    'http_req_duration{scenario:public_api}': ['p(95)<400', 'p(99)<800'],
    // lat_search/lat_listing/lat_detail don't need scoping: only public_api's
    // run() ever writes to them.
    lat_search: ['p(95)<600', 'p(99)<1200'],
    lat_listing: ['p(95)<300'],
    lat_detail: ['p(95)<300'],
    // lat_pool_pressure has no k6 threshold here: it's the metric a
    // perf-compare delta is meant to observe, not a limit this run enforces
    // on its own. It still shows up in every k6 summary.json and the
    // perf-compare report table. compare.mjs (not this file) excludes it
    // from the per-group pass/fail check. See INFORMATIONAL_GROUPS there
    // and perf/README.md.
  },
};

// Added only when PRESSURE=1: a fixed-arrival-rate hammer on /search, so
// queueing past the pool's capacity shows up directly as latency instead of
// being absorbed by k6 spinning up more VUs (ramping-vus would do that).
if (PRESSURE) {
  options.scenarios.pool_pressure = {
    executor: 'ramping-arrival-rate',
    startTime: afterPublicApi(),
    startRate: 0,
    timeUnit: '1s',
    preAllocatedVUs: Math.min(50, PRESSURE_MAX_VUS),
    maxVUs: PRESSURE_MAX_VUS,
    exec: 'poolPressureRun',
    stages: [
      { target: PRESSURE_RATE, duration: PRESSURE_RAMP },
      { target: PRESSURE_RATE, duration: PRESSURE_DURATION },
      { target: 0, duration: '10s' },
    ],
  };
}

// True during the warm-up scenario — used to skip recording gated metrics.
function warming() {
  return exec.scenario.name === 'warmup';
}

// True while pool_pressure is still inside its own ramp-in or ramp-down stage,
// rather than the steady-state window at PRESSURE_RATE. Mirrors warming()'s
// exclusion of public_api's warm-up samples: exec.scenario.startTime is the
// Unix-ms timestamp the scenario itself began at, so elapsedMs tracks progress
// through pool_pressure's own stages regardless of how PRESSURE_RAMP/
// PRESSURE_DURATION are overridden.
function poolPressureRamping() {
  const elapsedMs = Date.now() - exec.scenario.startTime;
  const rampMs = parseDurationMs(PRESSURE_RAMP);
  const steadyMs = parseDurationMs(PRESSURE_DURATION);
  return elapsedMs < rampMs || elapsedMs > rampMs + steadyMs;
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function get(path, trend, name) {
  const res = http.get(`${API}${path}`, { tags: { name } });
  // Don't let warm-up requests skew the gated per-group trends.
  if (trend && !warming()) trend.add(res.timings.duration);
  check(res, { [`${name} 200`]: (r) => r.status === 200 });
  return res;
}

// Weighted mix reflecting the real read paths web/ hits: mostly listings +
// detail lookups, a meaningful slice of search (the hotspot we care about).
// Shared by the warm-up and measured scenarios; warm-up requests are excluded
// from the gated trends inside get().
export function run() {
  const roll = Math.random();

  if (roll < 0.35) {
    group('listings', () => {
      get('/shows', tListing, 'shows_list');
      get('/on-demand/categories', tListing, 'categories_list');
      get('/articles', tListing, 'articles_list');
      get('/home', tListing, 'home');
      get('/schedule', tListing, 'schedule');
      get('/ticker', tListing, 'ticker');
    });
  } else if (roll < 0.75) {
    group('detail-by-slug', () => {
      get(`/shows/${pick(SHOW_SLUGS)}`, tDetail, 'show_detail');
      get(`/on-demand/categories/${pick(CATEGORY_SLUGS)}`, tDetail, 'category_detail');
      get(`/on-demand/subcategories/${pick(SUBCATEGORY_SLUGS)}`, tDetail, 'subcategory_detail');
    });
  } else {
    group('search', () => {
      // hit: a term that returns results
      get(`/search?q=${encodeURIComponent(pick(SEARCH_TERMS))}`, tSearch, 'search_hit');
      // miss: a term unlikely to match, still must respond fast and 200
      get(`/search?q=zzzznomatch${Math.random()}`, tSearch, 'search_miss');
    });
  }
}

// Only runs when the pool_pressure scenario is active. Alternates the two
// search types that actually reach Postgres (see SearchService.search():
// 'show' and 'episode' both open a Search.session(em); 'article'/'video' are
// served from an in-memory store and would test nothing here).
let poolPressureCalls = 0;
export function poolPressureRun() {
  const type = poolPressureCalls % 2 === 0 ? 'show' : 'episode';
  poolPressureCalls += 1;
  // Don't let pool_pressure's own ramp-in/ramp-down samples dilute the
  // steady-state signal in lat_pool_pressure (about 29% of its wall time at
  // the documented defaults).
  const trend = poolPressureRamping() ? null : tPoolPressure;
  get(`/search?q=${encodeURIComponent(pick(SEARCH_TERMS))}&type=${type}`,
    trend, `pool_pressure_${type}`);
}

// Emit a shareable HTML report + JSON summary + the usual console output.
export function handleSummary(data) {
  return {
    'results/summary.html': htmlReport(data),
    'results/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
