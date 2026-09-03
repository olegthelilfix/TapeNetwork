#!/usr/bin/env node
// Web page coverage check for issue #39.
//
// Scans web/src/app for Next.js `page.tsx` routes and compares them against the
// pages the user-journey (journey.js) actually visits. New public pages then
// surface here instead of silently escaping the load test — the frontend
// counterpart of generate-endpoints.mjs (which does the same for the API).
//
//   node pages-coverage.mjs                 # print coverage report
//   node pages-coverage.mjs --fail-on-gap   # exit 1 if a public page is uncovered
import { readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const APP_DIR = new URL('../web/src/app', import.meta.url).pathname;

// Route templates the journey drives (dynamic segments as {slug}).
const COVERED = [
  '/',
  '/shows',
  '/shows/{slug}',
  '/on-demand',
  '/on-demand/{category}',
  '/on-demand/{category}/{subcategory}',
  '/articles',
  '/watch/{slug}',
  '/search',
];

// Public pages that exist but the journey deliberately skips, with why.
const EXCLUDED = {
  '/articles/{slug}': 'article detail is a thin cached read; the /articles listing is journeyed',
};

// Walk web/src/app, turn each dir containing page.tsx into a route path.
function routes(dir, base = '') {
  let out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (!statSync(full).isDirectory()) continue;
    // (group) segments and @slots don't affect the URL; route groups are skipped
    const seg = name.startsWith('(') ? '' : name.replace(/^\[(\.\.\.)?/, '{').replace(/\]$/, '}');
    const routePath = seg ? `${base}/${seg}` : base;
    try {
      if (readdirSync(full).includes('page.tsx')) out.push(routePath || '/');
    } catch { /* ignore */ }
    out = out.concat(routes(full, routePath));
  }
  return out;
}

function main() {
  let found;
  try {
    const rootHasPage = readdirSync(APP_DIR).includes('page.tsx');
    found = [...new Set([...(rootHasPage ? ['/'] : []), ...routes(APP_DIR)])].sort();
  } catch (e) {
    console.error(`Could not scan ${APP_DIR}: ${e.message}`);
    process.exit(2);
  }

  const covered = new Set(COVERED);
  const excluded = new Set(Object.keys(EXCLUDED));
  const gaps = found.filter((p) => !covered.has(p) && !excluded.has(p));
  const stale = COVERED.filter((p) => !found.includes(p));

  console.log(`web/src/app pages found: ${found.length}`);
  found.forEach((p) => console.log(`   ${covered.has(p) ? '✓' : excluded.has(p) ? '–' : '✗'} ${p}`));
  if (gaps.length) {
    console.log('\n⚠️  UNCOVERED pages (add to journey.js + COVERED, or EXCLUDED with a reason):');
    gaps.forEach((p) => console.log(`   - ${p}`));
  } else {
    console.log('\n✅ Every public page is covered or explicitly excluded.');
  }
  if (stale.length) {
    console.log('\nℹ️  COVERED entries no longer a route (remove?):');
    stale.forEach((p) => console.log(`   - ${p}`));
  }
  if (process.argv.includes('--fail-on-gap') && gaps.length) process.exit(1);
}

main();
