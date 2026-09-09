#!/usr/bin/env bash
# Perf against an ALREADY-DEPLOYED stack (no throwaway stacks — that's the
# difference from perf-compare.yml). Runs k6 N times against a live BASE_URL,
# records each run with compare.mjs, then compares the two "halves" as a
# self-baseline to surface run-to-run drift and produce a median report.
#
# Designed to be invoked by the TeamCity "Perf x4" build config on the agent,
# which has this repo checked out and the host Docker socket mounted.
#
# Env (all optional, sane defaults):
#   BASE_URL   target API base incl. /api/v1   (default http://host.docker.internal:8080/api/v1)
#   RUNS       number of k6 runs               (default 4)
#   VUS RAMP DURATION WARMUP                    (k6 load shape; see scenarios.js)
#   MAX_REGRESSION  % drift gate                (default 15)
set -euxo pipefail

cd "$(dirname "$0")/.."          # repo root (script lives in perf/)
BASE_URL="${BASE_URL:-http://host.docker.internal:8080/api/v1}"
RUNS="${RUNS:-4}"
MAX_REGRESSION="${MAX_REGRESSION:-15}"
export VUS="${VUS:-20}" RAMP="${RAMP:-30s}" DURATION="${DURATION:-1m}" WARMUP="${WARMUP:-20s}"

OUT=perf/results
rm -rf "$OUT"; mkdir -p "$OUT"
HOST_UID="$(id -u)"; HOST_GID="$(id -g)"

# Prime the endpoints once (warm JIT + Caffeine + Lucene) before measuring.
PRIME="${BASE_URL}"
for _ in 1 2 3; do
  for p in /shows /on-demand/categories /articles /home /schedule /ticker "/search?q=macro"; do
    curl -fsS -o /dev/null "${PRIME}${p}" 2>/dev/null || true
  done
done

# k6 targets the live stack via host.docker.internal; sample docker stats too.
chmod +x perf/sample-stats.sh
for r in $(seq 1 "$RUNS"); do
  echo "::group::perf run $r/$RUNS"
  perf/sample-stats.sh "$OUT/stats-$r.csv" 2 "" &
  SAMPLER=$!
  set +e
  docker run --rm --add-host=host.docker.internal:host-gateway \
    --user "$HOST_UID:$HOST_GID" \
    -v "$PWD/perf:/perf" -w /perf \
    -e BASE_URL="$BASE_URL" \
    -e VUS -e RAMP -e DURATION -e WARMUP \
    grafana/k6 run scenarios.js
  set -e
  kill "$SAMPLER" 2>/dev/null || true; sleep 1

  [ -f "$OUT/summary.json" ] || { echo "run $r: k6 wrote no summary.json"; exit 1; }
  docker run --rm --user "$HOST_UID:$HOST_GID" -v "$PWD/perf:/perf" -w /perf node:20-alpine \
    node compare.mjs record \
      --k6 results/summary.json --stats "results/stats-$r.csv" \
      --label "run$r" --ref "$(git rev-parse --short HEAD 2>/dev/null || echo n/a)" \
      --out "results/record-$r.json"
  mv "$OUT/summary.json" "$OUT/summary-$r.json" 2>/dev/null || true
  echo "::endgroup::"
done

# Split the runs into two halves and compare median(first half) vs median(second
# half): with a stable stack the halves should match — a large delta means the
# environment (not code) drifted mid-measurement, which is exactly what you want
# to catch when validating a CI/CD setup. compare.mjs takes per-metric medians.
BASE_ARGS=(); HEAD_ARGS=()
half=$(( RUNS / 2 ))
for r in $(seq 1 "$half");            do BASE_ARGS+=(--base "$OUT/record-$r.json"); done
for r in $(seq $((half+1)) "$RUNS");  do HEAD_ARGS+=(--head "$OUT/record-$r.json"); done

set +e
docker run --rm --user "$HOST_UID:$HOST_GID" -v "$PWD/perf:/perf" -w /perf node:20-alpine \
  node compare.mjs compare \
    "${BASE_ARGS[@]}" "${HEAD_ARGS[@]}" \
    --max-regression "$MAX_REGRESSION" --md results/comparison.md
CMP_RC=$?
set -e

echo "===== comparison.md ====="
cat "$OUT/comparison.md" || true
echo "========================="

# TeamCity reads this as a build-status line and can gate on the exit code.
if [ "$CMP_RC" -ne 0 ]; then
  echo "##teamcity[buildProblem description='Perf drift > ${MAX_REGRESSION}% across runs']"
  exit 1
fi
echo "Perf stable across $RUNS runs (drift <= ${MAX_REGRESSION}%)."
