#!/usr/bin/env bash
# Run the public-API load test against a running stack and emit reports.
# Reproducible via the official grafana/k6 Docker image — no local k6 install.
#
#   ./run.sh                         # defaults (localhost:8080, 20 VUs, 1m)
#   BASE_URL=http://34.13.255.70:8080 ./run.sh
#   VUS=50 RAMP=1m DURATION=3m ./run.sh
#   PRESSURE=1 PRESSURE_DURATION=30s ./run.sh   # add the pool-pressure profile
#
# Outputs (in ./results/):
#   summary.json  — full k6 end-of-test summary (throughput + latency percentiles)
#   summary.html  — shareable HTML report
set -euo pipefail
cd "$(dirname "$0")"

BASE_URL="${BASE_URL:-http://localhost:8080}"
mkdir -p results

# On Linux, localhost inside the container isn't the host — rewrite to the
# docker host gateway. (No-op for a remote BASE_URL.)
HOST_FLAG=()
if [[ "$BASE_URL" == *localhost* || "$BASE_URL" == *127.0.0.1* ]]; then
  BASE_URL="${BASE_URL/localhost/host.docker.internal}"
  BASE_URL="${BASE_URL/127.0.0.1/host.docker.internal}"
  HOST_FLAG=(--add-host=host.docker.internal:host-gateway)
fi

echo "Load-testing public API at: $BASE_URL"

# The HTML + JSON reports are written by handleSummary() in scenarios.js into
# the mounted ./results dir. Pass-through env vars control the load profile.
docker run --rm -i "${HOST_FLAG[@]}" \
  -v "$PWD:/perf" -w /perf \
  -e BASE_URL="$BASE_URL" \
  -e VUS="${VUS:-}" -e RAMP="${RAMP:-}" -e DURATION="${DURATION:-}" \
  -e PRESSURE="${PRESSURE:-}" -e PRESSURE_RATE="${PRESSURE_RATE:-}" \
  -e PRESSURE_RAMP="${PRESSURE_RAMP:-}" -e PRESSURE_DURATION="${PRESSURE_DURATION:-}" \
  -e PRESSURE_MAX_VUS="${PRESSURE_MAX_VUS:-}" \
  -e SEARCH_Q="${SEARCH_Q:-}" \
  -e SLUGS_SHOWS="${SLUGS_SHOWS:-}" \
  -e SLUGS_CATEGORIES="${SLUGS_CATEGORIES:-}" \
  -e SLUGS_SUBCATEGORIES="${SLUGS_SUBCATEGORIES:-}" \
  grafana/k6 run scenarios.js

echo
echo "Reports written to perf/results/:"
echo "  summary.json  (JSON — throughput + p95/p99 latency, error rate)"
echo "  summary.html  (open in a browser)"
