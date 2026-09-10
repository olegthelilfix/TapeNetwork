// Stress / breakpoint test for the TapeNetwork PUBLIC API (/api/v1).
//
// Unlike scenarios.js / journey.js / cache.js — which hold a FIXED load profile so a
// master-vs-branch perf-compare delta is meaningful — this suite answers a different
// question: "how far can one backend instance be pushed before it breaks?" It ramps the
// virtual-user count in escalating stages well past the normal peak and watches where
// throughput stops rising and latency/errors take off (the knee point). That is exactly
// the capacity question issue #49 raises: the cache change is about scaling OUT, and this
// shows the ceiling of scaling a single node first.
//
// This is an AD-HOC suite (run it via perf/run.sh with SCRIPT=stress.js, or the perf.yml
// workflow_dispatch with suite=stress). It is deliberately NOT wired into perf-compare:
// a breakpoint has no meaningful "delta between two legs" to gate on.
//
// Reading the result:
//   - The per-stage console tags (name=stage_NN_vusVVV) + the http_reqs rate and the
//     p95 latency trend show where RPS plateaus while latency climbs — the knee.
//   - abortOnFail thresholds stop the run once it has clearly broken (sustained error
//     rate or exploded latency), so you don't wait out stages that are already failing.
//     A test that ABORTS here is the expected, informative outcome — not a bug.
//
// Env:
//   BASE_URL        default http://localhost:8080
//   STAGES          override the ramp, e.g. "10,25,50,100,200,400" (VU targets)
//   STAGE_DURATION  time held at each stage (default 30s)
//   STAGE_RAMP      ramp time INTO each stage (default 15s)
//   ABORT_ERROR_RATE  fail+abort when failed-request rate exceeds this (default 0.10)
//   ABORT_P95_MS      fail+abort when overall p95 exceeds this, ms (default 2000)
import http from 'k6/http';
import { check, group } from 'k6';
import exec from 'k6/execution';
import { Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const BASE = __ENV.BASE_URL || 'http://localhost:8080';
const API = `${BASE}/api/v1`;

function list(name, fallback) {
  const raw = __ENV[name];
  return (raw ? raw.split(',') : fallback).map((s) => s.trim()).filter(Boolean);
}
const SHOW_SLUGS = new SharedArray('shows', () =>
  list('SLUGS_SHOWS', ['the-opening-bell', 'the-vol-desk', 'chart-session']));
const CATEGORY_SLUGS = new SharedArray('categories', () =>
  list('SLUGS_CATEGORIES', ['earnings', 'macro-rates', 'options-volatility', 'technicals-flow']));
const SEARCH_TERMS = new SharedArray('search', () =>
  list('SEARCH_Q', ['EURUSD', 'Earnings', 'macro', 'options', 'volatility']));

// Escalating VU targets — override with STAGES="10,25,50,...".
const STAGE_TARGETS = (__ENV.STAGES
  ? __ENV.STAGES.split(',')
  : ['10', '25', '50', '100', '150', '200', '300']
).map((s) => Number(s.trim())).filter((n) => n > 0);
const STAGE_DURATION = __ENV.STAGE_DURATION || '30s';
const STAGE_RAMP = __ENV.STAGE_RAMP || '15s';
const ABORT_ERROR_RATE = Number(__ENV.ABORT_ERROR_RATE || 0.10);
const ABORT_P95_MS = Number(__ENV.ABORT_P95_MS || 2000);

// Build ramping-vus stages: ramp INTO each target, then hold it.
const stages = [];
for (const target of STAGE_TARGETS) {
  stages.push({ duration: STAGE_RAMP, target });
  stages.push({ duration: STAGE_DURATION, target });
}
stages.push({ duration: '10s', target: 0 }); // graceful ramp-down

const tLatency = new Trend('lat_all', true);

export const options = {
  summaryTrendStats: ['avg', 'min', 'med', 'p(95)', 'p(99)', 'max'],
  scenarios: {
    stress: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages,
      gracefulRampDown: '5s',
    },
  },
  thresholds: {
    // These ABORT the run the moment the system has clearly broken, so we stop
    // climbing once past the knee. abortOnFail = the breakpoint has been found.
    http_req_failed: [
      { threshold: `rate<${ABORT_ERROR_RATE}`, abortOnFail: true, delayAbortEval: '10s' },
    ],
    http_req_duration: [
      { threshold: `p(95)<${ABORT_P95_MS}`, abortOnFail: true, delayAbortEval: '10s' },
    ],
  },
};

// Current stage index by elapsed time — used only to TAG requests so the per-stage
// breakdown (RPS/latency at each VU level) is visible in the summary/report.
const STAGE_BOUNDARIES = (() => {
  // cumulative end-time (s) of each HOLD stage, paired with its VU target
  let t = 0;
  const rampS = toSec(STAGE_RAMP);
  const holdS = toSec(STAGE_DURATION);
  return STAGE_TARGETS.map((target) => {
    t += rampS + holdS;
    return { endS: t, target };
  });
})();

function toSec(d) {
  const m = /^(\d+)(s|m)$/.exec(String(d).trim());
  if (!m) return 30;
  return m[2] === 'm' ? Number(m[1]) * 60 : Number(m[1]);
}

function stageTag() {
  // k6-native elapsed time (ms since test start) — no manual start bookkeeping.
  const elapsed = exec.instance.currentTestRunDuration / 1000;
  for (let i = 0; i < STAGE_BOUNDARIES.length; i++) {
    if (elapsed <= STAGE_BOUNDARIES[i].endS) {
      return `stage_${String(i).padStart(2, '0')}_vus${STAGE_BOUNDARIES[i].target}`;
    }
  }
  return 'rampdown';
}

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function get(path, name) {
  const res = http.get(`${API}${path}`, { tags: { name, stage: stageTag() } });
  tLatency.add(res.timings.duration);
  check(res, { [`${name} 200`]: (r) => r.status === 200 });
  return res;
}

// Same weighted read mix as scenarios.js, so the stress load resembles real traffic.
export default function () {
  const roll = Math.random();
  if (roll < 0.35) {
    group('listings', () => {
      get('/shows', 'shows_list');
      get('/on-demand/categories', 'categories_list');
      get('/home', 'home');
      get('/ticker', 'ticker');
    });
  } else if (roll < 0.75) {
    group('detail-by-slug', () => {
      get(`/shows/${pick(SHOW_SLUGS)}`, 'show_detail');
      get(`/on-demand/categories/${pick(CATEGORY_SLUGS)}`, 'category_detail');
    });
  } else {
    group('search', () => {
      get(`/search?q=${encodeURIComponent(pick(SEARCH_TERMS))}`, 'search_hit');
      get(`/search?q=zzzznomatch${Math.random()}`, 'search_miss');
    });
  }
}

export function handleSummary(data) {
  return {
    'results/summary.html': htmlReport(data),
    'results/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
