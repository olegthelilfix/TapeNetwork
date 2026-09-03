#!/usr/bin/env node
// Minimal OpenAPI coverage check for issue #5.
//
// Pulls the live springdoc spec (/v3/api-docs), extracts every GET path under
// /api/v1, and compares it against the endpoints scenarios.js exercises. New
// public endpoints then surface here automatically instead of being silently
// unloaded. This is a COVERAGE checker, not a request generator — the load
// itself is hand-written in scenarios.js so slugs/search terms are meaningful.
//
// Usage:
//   node generate-endpoints.mjs                 # print coverage report
//   node generate-endpoints.mjs --write         # also write covered.json
//   BASE_URL=http://host:8080 node generate-endpoints.mjs
//   node generate-endpoints.mjs --fail-on-gap   # exit 1 if uncovered endpoints exist
import { writeFileSync } from 'node:fs';

const BASE = process.env.BASE_URL || 'http://localhost:8080';
const SPEC_URL = `${BASE}/v3/api-docs`;

// Endpoint templates scenarios.js drives (path with {slug} placeholders).
// Keep in sync when adding a scenario; the checker flags anything in the spec
// that's missing here.
const COVERED = [
  '/api/v1/shows',
  '/api/v1/shows/{slug}',
  '/api/v1/articles',
  '/api/v1/on-demand/categories',
  '/api/v1/on-demand/categories/{slug}',
  '/api/v1/on-demand/subcategories/{slug}',
  '/api/v1/home',
  '/api/v1/schedule',
  '/api/v1/ticker',
  '/api/v1/search',
];

// Public read endpoints that exist but are deliberately NOT load-tested, with why.
const EXCLUDED = {
  '/api/v1/health': 'trivial liveness probe, no DB work',
  '/api/v1/sitemap-data': 'SEO crawler path, not a user-facing hot read',
  '/api/v1/on-demand/videos/{slug}': 'covered indirectly; video detail is a thin lookup',
  '/api/v1/articles/{slug}': 'covered indirectly; article detail is a thin cached read',
  '/api/v1/watch/{slug}': 'returns a player DTO; streaming itself is out of backend scope',
};

function normalize(p) {
  // springdoc emits {slug} style path params already; keep as-is.
  return p;
}

async function main() {
  let spec;
  try {
    const res = await fetch(SPEC_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    spec = await res.json();
  } catch (e) {
    console.error(`Could not fetch OpenAPI from ${SPEC_URL}: ${e.message}`);
    console.error('Is the stack up? Try: docker compose up -d');
    process.exit(2);
  }

  const specGets = Object.entries(spec.paths || {})
    .filter(([p]) => p.startsWith('/api/v1'))
    .filter(([, ops]) => 'get' in ops)
    .map(([p]) => normalize(p))
    .sort();

  const covered = new Set(COVERED);
  const excluded = new Set(Object.keys(EXCLUDED));

  const gaps = specGets.filter((p) => !covered.has(p) && !excluded.has(p));
  const staleCovered = COVERED.filter((p) => !specGets.includes(p));

  console.log(`OpenAPI: ${SPEC_URL}`);
  console.log(`Public GET endpoints in spec: ${specGets.length}`);
  console.log(`  covered by scenarios : ${specGets.filter((p) => covered.has(p)).length}`);
  console.log(`  explicitly excluded  : ${specGets.filter((p) => excluded.has(p)).length}`);
  if (gaps.length) {
    console.log('\n⚠️  UNCOVERED public endpoints (add a scenario or exclude with a reason):');
    gaps.forEach((p) => console.log(`   - ${p}`));
  } else {
    console.log('\n✅ Every public GET endpoint is covered or explicitly excluded.');
  }
  if (staleCovered.length) {
    console.log('\nℹ️  COVERED entries no longer in the spec (remove from scenarios?):');
    staleCovered.forEach((p) => console.log(`   - ${p}`));
  }

  if (process.argv.includes('--write')) {
    const out = { specUrl: SPEC_URL, specGets, covered: COVERED, excluded: EXCLUDED, gaps };
    writeFileSync(new URL('./covered.json', import.meta.url), JSON.stringify(out, null, 2));
    console.log('\nWrote covered.json');
  }

  if (process.argv.includes('--fail-on-gap') && gaps.length) process.exit(1);
}

main();
