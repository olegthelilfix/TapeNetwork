#!/usr/bin/env node
// Record a perf run into a compact JSON, or compare two such records.
//
//   node compare.mjs record  --k6 results/summary.json --stats results/stats.csv \
//                            --label master --ref <sha> --out perf-record.json
//
//   node compare.mjs compare --base base.json --head head.json \
//                            [--max-regression 15] [--md report.md]
//     Prints a markdown delta table. Exits 1 if any latency/error metric is
//     worse than base by more than --max-regression percent.
import { readFileSync, writeFileSync } from 'node:fs';
import { metricsFromK6, peaksFromStats } from './lib-metrics.mjs';

const argv = process.argv.slice(2);
const cmd = argv[0];
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : def;
};
// All values of a repeatable flag, e.g. --base a.json --base b.json.
const optAll = (name) => {
  const out = [];
  for (let i = 0; i < argv.length; i++) if (argv[i] === `--${name}`) out.push(argv[i + 1]);
  return out;
};

function median(nums) {
  const xs = nums.filter((n) => n != null && !Number.isNaN(n)).sort((a, b) => a - b);
  if (!xs.length) return null;
  const mid = Math.floor(xs.length / 2);
  const m = xs.length % 2 ? xs[mid] : (xs[mid - 1] + xs[mid]) / 2;
  return Math.round(m * 100) / 100;
}

// Merge N per-run records (same leg) into one by taking the per-metric median —
// cancels the position bias where whichever leg runs second looks faster.
function medianRecord(records) {
  if (records.length === 1) return records[0];
  const k6s = records.map((r) => r.k6);
  const groupNames = [...new Set(k6s.flatMap((k) => Object.keys(k.groups || {})))];
  const groups = {};
  for (const g of groupNames) {
    groups[g] = {
      p95: median(k6s.map((k) => k.groups?.[g]?.p95)),
      p99: median(k6s.map((k) => k.groups?.[g]?.p99)),
    };
  }
  const svcNames = [...new Set(records.flatMap((r) => Object.keys(r.peaks || {})))];
  const peaks = {};
  for (const s of svcNames) {
    peaks[s] = {
      cpu_pct: median(records.map((r) => r.peaks?.[s]?.cpu_pct)),
      mem_mib: median(records.map((r) => r.peaks?.[s]?.mem_mib)),
    };
  }
  return {
    label: records[0].label,
    ref: records[0].ref,
    runs: records.length,
    k6: {
      rps: median(k6s.map((k) => k.rps)),
      p95: median(k6s.map((k) => k.p95)),
      p99: median(k6s.map((k) => k.p99)),
      error_rate: median(k6s.map((k) => k.error_rate)),
      groups,
    },
    peaks,
  };
}

if (cmd === 'record') {
  const record = {
    label: opt('label', 'run'),
    ref: opt('ref', ''),
    at: new Date().toISOString(),
    k6: metricsFromK6(opt('k6', 'results/summary.json')),
    peaks: peaksFromStats(opt('stats')),
  };
  const out = opt('out', 'perf-record.json');
  writeFileSync(out, JSON.stringify(record, null, 2));
  console.log(`Wrote ${out}`);
  console.log(JSON.stringify(record, null, 2));
} else if (cmd === 'compare') {
  const baseFiles = optAll('base').length ? optAll('base') : [opt('base')];
  const headFiles = optAll('head').length ? optAll('head') : [opt('head')];
  const base = medianRecord(baseFiles.map((f) => JSON.parse(readFileSync(f, 'utf8'))));
  const head = medianRecord(headFiles.map((f) => JSON.parse(readFileSync(f, 'utf8'))));
  const maxReg = Number(opt('max-regression', 15));

  let regressed = false;

  // --- Overall + error rate (gated); throughput (informational) ---
  const overallRows = [];
  for (const { key, gate } of [
    { key: 'rps', gate: false },
    { key: 'p95', gate: true },
    { key: 'p99', gate: true },
    { key: 'error_rate', gate: true },
  ]) {
    const b = base.k6[key];
    const h = head.k6[key];
    const higherWorse = key !== 'rps';
    const { pct, verdict, bad } = judge(b, h, higherWorse, maxReg);
    if (gate && bad) regressed = true;
    overallRows.push([label(key), fmt(b), fmt(h), pct, verdict]);
  }

  // --- Per-group p95/p99 (gated), auto-discovered from both records ---
  const groupNames = [...new Set([
    ...Object.keys(base.k6.groups || {}),
    ...Object.keys(head.k6.groups || {}),
  ])].sort();
  const groupRows = [];
  for (const g of groupNames) {
    for (const stat of ['p95', 'p99']) {
      const b = base.k6.groups?.[g]?.[stat];
      const h = head.k6.groups?.[g]?.[stat];
      const { pct, verdict, bad } = judge(b, h, true, maxReg);
      if (bad) regressed = true;
      groupRows.push([`${prettyGroup(g)} ${stat}`, fmt(b), fmt(h), pct, verdict]);
    }
  }

  // Peak resource use per service (informational; not gated — noisy).
  const svcs = new Set([...Object.keys(base.peaks || {}), ...Object.keys(head.peaks || {})]);
  const peakRows = [];
  for (const svc of svcs) {
    const bp = base.peaks?.[svc] || {};
    const hp = head.peaks?.[svc] || {};
    peakRows.push([svc, fmt(bp.cpu_pct), fmt(hp.cpu_pct), fmt(bp.mem_mib), fmt(hp.mem_mib)]);
  }

  const md = renderMd(base, head, overallRows, groupRows, peakRows, maxReg, regressed);
  process.stdout.write(md + '\n');
  const mdOut = opt('md');
  if (mdOut) writeFileSync(mdOut, md);

  if (regressed) {
    console.error(`\nPerf regression > ${maxReg}% vs base — failing.`);
    process.exit(1);
  }
} else {
  console.error('usage: compare.mjs record|compare ...');
  process.exit(2);
}

function judge(b, h, higherIsWorse, maxReg) {
  if (b == null || h == null || b === 0) return { pct: 'n/a', verdict: '—', bad: false };
  const deltaPct = ((h - b) / b) * 100;
  const worse = higherIsWorse ? deltaPct > 0 : deltaPct < 0;
  const bad = worse && Math.abs(deltaPct) > maxReg;
  const sign = deltaPct > 0 ? '+' : '';
  const arrow = worse ? (bad ? '🔴' : '🟡') : '🟢';
  return { pct: `${sign}${deltaPct.toFixed(1)}%`, verdict: arrow, bad };
}

function renderMd(base, head, overallRows, groupRows, peakRows, maxReg, regressed) {
  const head1 = regressed
    ? `### ⚠️ Perf comparison — regression detected (> ${maxReg}%)`
    : `### ✅ Perf comparison — within ${maxReg}% of base`;
  let md = `${head1}\n\n`;
  md += `**base** \`${base.label}\` (${base.ref || 'n/a'}) vs **head** \`${head.label}\` (${head.ref || 'n/a'})\n\n`;
  md += '| Metric | base | head | Δ | |\n|---|---|---|---|---|\n';
  for (const [k, b, h, pct, v] of overallRows) md += `| ${k} | ${b} | ${h} | ${pct} | ${v} |\n`;
  if (groupRows.length) {
    md += '\n**Per-group latency**\n\n';
    md += '| Group | base | head | Δ | |\n|---|---|---|---|---|\n';
    for (const [k, b, h, pct, v] of groupRows) md += `| ${k} | ${b} | ${h} | ${pct} | ${v} |\n`;
  }
  if (peakRows.length) {
    md += '\n**Peak resource use (informational)**\n\n';
    md += '| Service | base CPU% | head CPU% | base mem MiB | head mem MiB |\n|---|---|---|---|---|\n';
    for (const r of peakRows) md += `| ${r.join(' | ')} |\n`;
  }
  md += `\n<sub>🟢 better · 🟡 worse but within budget · 🔴 regression > ${maxReg}%. Latency (overall + per-group) & error gated; throughput & resources informational.</sub>`;
  return md;
}

// lat_search -> "search", page_home -> "home"
function prettyGroup(g) {
  return g.replace(/^(lat|page)_/, '');
}

function label(key) {
  return {
    rps: 'Throughput (req/s)', p95: 'Latency p95 (ms)', p99: 'Latency p99 (ms)',
    error_rate: 'Error rate',
  }[key] || key;
}
function fmt(v) { return v == null ? 'n/a' : String(v); }
