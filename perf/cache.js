// Cache-focused load/perf test for TapeNetwork — issue #49 (Caffeine -> embedded Hazelcast).
//
// The general suite (scenarios.js) already loads every public endpoint and would catch a
// broad latency regression. This suite isolates the two costs the cache-backend swap
// actually introduces, as their OWN gated metrics, so a Caffeine-vs-Hazelcast comparison
// (perf-compare master vs branch) shows them instead of burying them in the endpoint mix:
//
//   lat_cache_hit        — read path that is (almost) always a cache HIT. With Hazelcast a
//                          hit now deserializes the stored value; Caffeine returned it by
//                          reference (~0). This is the hot, high-frequency path.
//   lat_evict_write      — admin write that fires @EvictsPublicContent -> IMap.clear(). With
//                          Hazelcast the clear is cluster-wide; with Caffeine it was local.
//   lat_read_after_evict — first public read after that write: a cache MISS + repopulate.
//
// The eviction half only runs when ADMIN_EMAIL/ADMIN_PASSWORD are set (default dev creds);
// it uses an idempotent PUT that re-writes a row to its own current value, so it triggers
// eviction WITHOUT changing data. Keep it low-rate so it doesn't dominate the read metric.
//
// Env (in addition to the shared VUS/RAMP/DURATION/WARMUP):
//   BASE_URL        default http://localhost:8080
//   ADMIN_EMAIL     default admin@tape.local   (set empty to skip the eviction scenario)
//   ADMIN_PASSWORD  default password
//   HOT_PATHS       comma-list of cached GET paths to hammer as hits
//                   (default /shows,/on-demand/categories,/schedule,/ticker)
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import exec from 'k6/execution';
import { Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const BASE = __ENV.BASE_URL || 'http://localhost:8080';
const API = `${BASE}/api/v1`;
const ADMIN_EMAIL = __ENV.ADMIN_EMAIL === undefined ? 'admin@tape.local' : __ENV.ADMIN_EMAIL;
const ADMIN_PASSWORD = __ENV.ADMIN_PASSWORD || 'password';
const EVICT_ENABLED = ADMIN_EMAIL !== '';

function list(name, fallback) {
  const raw = __ENV[name];
  return (raw ? raw.split(',') : fallback).map((s) => s.trim()).filter(Boolean);
}
// Cached listing endpoints — reads here are almost always cache hits after warm-up.
const HOT_PATHS = new SharedArray('hot', () =>
  list('HOT_PATHS', ['/shows', '/on-demand/categories', '/schedule', '/ticker']));

const tHit = new Trend('lat_cache_hit', true);
const tEvictWrite = new Trend('lat_evict_write', true);
const tReadAfterEvict = new Trend('lat_read_after_evict', true);

const VUS = Number(__ENV.VUS || 20);
const RAMP = __ENV.RAMP || '30s';
const DURATION = __ENV.DURATION || '1m';
const WARMUP = __ENV.WARMUP || '20s';

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(95)', 'p(99)', 'max'],
  scenarios: {
    // Warm-up: populate the caches so the measured reads are hits. Not gated (see hitRead()).
    warmup: {
      executor: 'constant-vus',
      vus: 3,
      duration: WARMUP,
      exec: 'hitRead',
      tags: { phase: 'warmup' },
    },
    // Hot read path — the high-frequency cache-hit load we actually care about.
    cache_hits: {
      executor: 'ramping-vus',
      startVUs: 1,
      startTime: WARMUP,
      exec: 'hitRead',
      stages: [
        { duration: RAMP, target: VUS },
        { duration: DURATION, target: VUS },
        { duration: '10s', target: 0 },
      ],
    },
    // Low-rate eviction loop on a single VU: idempotent admin write -> immediate public read.
    // Isolated so the cluster-wide clear() cost and the miss-repopulate read are visible.
    ...(EVICT_ENABLED
      ? {
          evictions: {
            executor: 'constant-vus',
            vus: 1,
            startTime: WARMUP,
            duration: `${parseDur(RAMP) + parseDur(DURATION)}s`,
            exec: 'evictCycle',
          },
        }
      : {}),
  },
  thresholds: {
    http_req_failed: ['rate<0.01'],
    // A cache hit (even with deserialization) must stay fast.
    lat_cache_hit: ['p(95)<300', 'p(99)<600'],
    // Read right after an eviction is a miss+repopulate — allow more headroom.
    lat_read_after_evict: ['p(95)<500'],
  },
};

// Parse a k6 duration like '30s' / '1m' into seconds (only s/m needed here).
function parseDur(d) {
  const m = /^(\d+)(s|m)$/.exec(String(d).trim());
  if (!m) return 60;
  return m[2] === 'm' ? Number(m[1]) * 60 : Number(m[1]);
}

function warming() {
  return exec.scenario.name === 'warmup';
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Cache-hit read path: hammer a hot cached endpoint. Warm-up requests are excluded
// from the gated trend so cold-start doesn't pollute the hit metric.
export function hitRead() {
  const path = pick(HOT_PATHS);
  const res = http.get(`${API}${path}`, { tags: { name: 'cache_hit' } });
  if (!warming()) tHit.add(res.timings.duration);
  check(res, { 'cache hit 200': (r) => r.status === 200 });
}

// One eviction cycle: log in (once, cached in VU state), idempotent PUT that fires
// @EvictsPublicContent, then a public read that must miss and repopulate.
let adminToken = null;
function login() {
  if (adminToken) return adminToken;
  const res = http.post(`${API.replace('/api/v1', '')}/api/admin/auth/login`,
    JSON.stringify({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD }),
    { headers: { 'Content-Type': 'application/json' }, tags: { name: 'admin_login' } });
  if (res.status === 200) {
    try { adminToken = res.json('token'); } catch (_) { adminToken = null; }
  }
  return adminToken;
}

export function evictCycle() {
  group('evict', () => {
    const token = login();
    if (!token) { sleep(1); return; }
    const auth = { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };

    // Read the first ticker row, then PUT it back UNCHANGED — idempotent write that still
    // triggers @EvictsPublicContent. (Ticker is the cheapest admin resource to round-trip.)
    const listRes = http.get(`${BASE}/api/admin/ticker`, { ...auth, tags: { name: 'admin_ticker_list' } });
    let row = null;
    try {
      const body = listRes.json();
      const items = Array.isArray(body) ? body : (body.content || body.items || []);
      row = items && items.length ? items[0] : null;
    } catch (_) { row = null; }
    if (!row || row.id == null) { sleep(2); return; }

    const put = http.put(`${BASE}/api/admin/ticker/${row.id}`, JSON.stringify(row),
      { ...auth, tags: { name: 'evict_write' } });
    tEvictWrite.add(put.timings.duration);
    check(put, { 'evict write 2xx': (r) => r.status >= 200 && r.status < 300 });

    // First public read after the evict — cache miss + repopulate.
    const readBack = http.get(`${API}/ticker`, { tags: { name: 'read_after_evict' } });
    tReadAfterEvict.add(readBack.timings.duration);
    check(readBack, { 'read after evict 200': (r) => r.status === 200 });

    sleep(2); // low rate: one eviction cycle every ~2s, so hits stay dominant
  });
}

export function handleSummary(data) {
  return {
    'results/summary.html': htmlReport(data),
    'results/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
