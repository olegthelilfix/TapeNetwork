// Shared metric extraction for perf runs (issue #5 / #30).
// Reads a k6 handleSummary JSON and (optionally) the docker-stats CSV, and
// distills both into a small, comparable record.
import { readFileSync, existsSync } from 'node:fs';

// Pull the numbers we compare across runs from a k6 summary.json.
export function metricsFromK6(summaryPath) {
  const s = JSON.parse(readFileSync(summaryPath, 'utf8'));
  const m = s.metrics || {};
  const dur = m.http_req_duration?.values || {};
  const search = m.lat_search?.values || {};
  const reqs = m.http_reqs?.values || {};
  const failed = m.http_req_failed?.values || {};
  return {
    rps: round(reqs.rate),                       // throughput
    reqs: reqs.count ?? null,
    p95: round(dur['p(95)']),                    // overall latency
    p99: round(dur['p(99)']),
    search_p95: round(search['p(95)']),          // search hotspot
    search_p99: round(search['p(99)']),
    error_rate: round(failed.rate, 4),           // 0..1
  };
}

// Peak per-container CPU% and mem (MiB) from the stats CSV, keyed by service.
export function peaksFromStats(csvPath) {
  if (!csvPath || !existsSync(csvPath)) return {};
  const lines = readFileSync(csvPath, 'utf8').trim().split('\n');
  lines.shift(); // header
  const peak = {};
  for (const line of lines) {
    const [, container, cpu, memUsed] = line.split(',');
    if (!container) continue;
    const svc = serviceName(container);
    const cpuN = Number(cpu) || 0;
    const memN = toMiB(memUsed);
    peak[svc] ??= { cpu_pct: 0, mem_mib: 0 };
    peak[svc].cpu_pct = Math.max(peak[svc].cpu_pct, round(cpuN));
    peak[svc].mem_mib = Math.max(peak[svc].mem_mib, round(memN));
  }
  return peak;
}

// "perf_123-backend-1" / "perf_123_backend_1" -> "backend"
function serviceName(container) {
  const m = container.match(/(?:^|[-_])(backend|postgres|web|cms|streamer)(?:[-_]|$)/i);
  return m ? m[1].toLowerCase() : container;
}

function toMiB(memStr) {
  if (!memStr) return 0;
  const m = memStr.trim().match(/^([\d.]+)\s*([KMGT]?i?B)$/i);
  if (!m) return 0;
  const n = Number(m[1]);
  const unit = m[2].toUpperCase();
  const factor = { B: 1 / 1048576, KIB: 1 / 1024, MIB: 1, GIB: 1024, KB: 1 / 1024, MB: 1, GB: 1024 };
  return n * (factor[unit] ?? 1);
}

function round(n, dp = 2) {
  if (n == null || Number.isNaN(n)) return null;
  const f = 10 ** dp;
  return Math.round(n * f) / f;
}
