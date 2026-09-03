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
// Thresholds fail the run (k6 exits non-zero) if latency/error budgets are blown.
import http from 'k6/http';
import { check, group } from 'k6';
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

const VUS = Number(__ENV.VUS || 20);
const RAMP = __ENV.RAMP || '30s';
const DURATION = __ENV.DURATION || '1m';

export const options = {
  // Make p99 available in the summary (k6 defaults omit it).
  summaryTrendStats: ['avg', 'min', 'med', 'p(95)', 'p(99)', 'max'],
  scenarios: {
    public_api: {
      executor: 'ramping-vus',
      startVUs: 1,
      stages: [
        { duration: RAMP, target: VUS },
        { duration: DURATION, target: VUS },
        { duration: '10s', target: 0 },
      ],
    },
  },
  thresholds: {
    // global error budget: <1% failed requests
    http_req_failed: ['rate<0.01'],
    // overall latency budget
    http_req_duration: ['p(95)<400', 'p(99)<800'],
    // search is the expected hotspot — looser but still bounded
    lat_search: ['p(95)<600', 'p(99)<1200'],
    lat_listing: ['p(95)<300'],
    lat_detail: ['p(95)<300'],
  },
};

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function get(path, trend, name) {
  const res = http.get(`${API}${path}`, { tags: { name } });
  if (trend) trend.add(res.timings.duration);
  check(res, { [`${name} 200`]: (r) => r.status === 200 });
  return res;
}

// Weighted mix reflecting the real read paths web/ hits: mostly listings +
// detail lookups, a meaningful slice of search (the hotspot we care about).
export default function () {
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

// Emit a shareable HTML report + JSON summary + the usual console output.
export function handleSummary(data) {
  return {
    'results/summary.html': htmlReport(data),
    'results/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
