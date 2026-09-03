// Full-service user-journey load test — issue #39.
// Drives the REAL web frontend (Next.js SSR pages on :3000), not the backend
// API directly. Each iteration walks a plausible visitor path with think-time,
// so page latency reflects SSR render + the web→backend fetch chain + assets —
// what a real user feels. Admin/CMS out of scope.
//
// Env (see README):
//   WEB_URL     default http://localhost:3000
//   VUS/RAMP/DURATION   load profile (as in scenarios.js)
//   THINK_MIN/THINK_MAX seconds of think-time between steps (default 1..3)
//   SLUGS_*, SEARCH_Q   real seed slugs / terms (shared with scenarios.js)
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { Trend } from 'k6/metrics';
import { SharedArray } from 'k6/data';
import { htmlReport } from 'https://raw.githubusercontent.com/benc-uk/k6-reporter/main/dist/bundle.js';
import { textSummary } from 'https://jslib.k6.io/k6-summary/0.0.1/index.js';

const WEB = __ENV.WEB_URL || 'http://localhost:3000';

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
const WATCH_SLUGS = new SharedArray('watch', () =>
  list('SLUGS_WATCH', [
    'chips-lead-a-narrow-tape-as-breadth-thins-into-the-fed-window',
    'semis-earnings-scorecard-guidance-versus-the-multiple',
    'close-auctions-the-five-minutes-that-set-your-fill',
  ]));
const SEARCH_TERMS = new SharedArray('search', () =>
  list('SEARCH_Q', ['EURUSD', 'Earnings', 'macro', 'options', 'volatility']));

// Per journey-step page-load latency (SSR is slower than the raw API).
const pHome = new Trend('page_home', true);
const pListing = new Trend('page_listing', true);
const pDetail = new Trend('page_detail', true);
const pSearch = new Trend('page_search', true);
const pWatch = new Trend('page_watch', true);

const VUS = Number(__ENV.VUS || 20);
const RAMP = __ENV.RAMP || '30s';
const DURATION = __ENV.DURATION || '1m';
const THINK_MIN = Number(__ENV.THINK_MIN || 1);
const THINK_MAX = Number(__ENV.THINK_MAX || 3);

export const options = {
  scenarios: {
    user_journey: {
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
    http_req_failed: ['rate<0.01'],
    // SSR page loads — budgets higher than the API suite (whole render chain).
    http_req_duration: ['p(95)<1500', 'p(99)<3000'],
    page_home: ['p(95)<1200'],
    page_listing: ['p(95)<1500'],
    page_detail: ['p(95)<1800'],
    page_search: ['p(95)<2000', 'p(99)<3500'],
    page_watch: ['p(95)<1800'],
  },
};

function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
function think() { sleep(THINK_MIN + Math.random() * (THINK_MAX - THINK_MIN)); }

// Load a page's HTML document (SSR). Assets under _next are fetched by real
// browsers separately; k6 is protocol-level, so we measure the document — the
// server-side cost. name tags it; trend records page latency.
function page(path, trend, name) {
  const res = http.get(`${WEB}${path}`, { tags: { name } });
  trend.add(res.timings.duration);
  check(res, {
    [`${name} 200`]: (r) => r.status === 200,
    [`${name} is html`]: (r) => (r.headers['Content-Type'] || '').includes('text/html'),
  });
  return res;
}

// One visitor session: land -> browse -> drill in -> watch -> search -> read.
// Think-time between steps so VUs model humans, not a hammer.
export default function () {
  group('journey', () => {
    page('/', pHome, 'home');
    think();

    page('/shows', pListing, 'shows_list');
    think();
    page(`/shows/${pick(SHOW_SLUGS)}`, pDetail, 'show_detail');
    think();

    page('/on-demand', pListing, 'ondemand_list');
    think();
    page(`/on-demand/${pick(CATEGORY_SLUGS)}`, pListing, 'category');
    think();
    page(`/on-demand/${pick(CATEGORY_SLUGS)}/${pick(SUBCATEGORY_SLUGS)}`, pListing, 'subcategory');
    think();

    // watch a real episode (the /watch page takes an episode slug)
    page(`/watch/${pick(WATCH_SLUGS)}`, pWatch, 'watch');
    think();

    page(`/search?q=${encodeURIComponent(pick(SEARCH_TERMS))}`, pSearch, 'search');
    think();

    page('/articles', pListing, 'articles_list');
  });
}

export function handleSummary(data) {
  return {
    'results/summary.html': htmlReport(data),
    'results/summary.json': JSON.stringify(data, null, 2),
    stdout: textSummary(data, { indent: ' ', enableColors: true }),
  };
}
