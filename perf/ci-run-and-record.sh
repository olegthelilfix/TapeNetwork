#!/usr/bin/env bash
# Runs ON THE VM (piped over ssh stdin by the perf workflows). Expects these
# env vars set by the ssh command: DIR PROJECT BACKEND_PORT POSTGRES_PORT
# VUS RAMP DURATION REF [LABEL] [SUITE] [WEB_PORT].
#
# SUITE=scenarios (default) — load the backend API (/api/v1) directly.
# SUITE=journey             — bring up the web frontend too and drive real
#                             SSR pages as a user journey (issue #39).
#
# Brings up an isolated throwaway stack of the shipped source, runs k6 while
# sampling docker stats, and distills the run into perf/results/perf-record.json
# (compact, comparable). Never touches the live prod stack.
set -euxo pipefail
cd "$DIR"
tar xzf src.tgz
mkdir -p perf/results
# perf/results is owned by the SSH 'deploy' user; run the k6/node containers as
# that same uid:gid (below) so their writes land as deploy and don't hit
# 'permission denied'.
HOST_UID="$(id -u)"; HOST_GID="$(id -g)"

SUITE="${SUITE:-scenarios}"
export BACKEND_PORT POSTGRES_PORT

if [ "$SUITE" = "journey" ]; then
  export WEB_PORT
  # web depends on backend, which depends on postgres — compose brings all up.
  docker compose -p "$PROJECT" up -d --build web
  # web is baked to talk to the API at build time; give SSR a moment.
  for i in $(seq 1 60); do
    if curl -fsS "http://localhost:${WEB_PORT}/" >/dev/null 2>&1; then
      echo "web healthy"; break
    fi
    sleep 5
    [ "$i" -eq 60 ] && { echo "web never became healthy"; exit 1; }
  done
  K6_SCRIPT="journey.js"
  TARGET_ENV=(-e WEB_URL="http://host.docker.internal:${WEB_PORT}")
  # Prime the real pages once so JIT/SSR/caches are warm before measuring.
  PRIME_BASE="http://localhost:${WEB_PORT}"
  PRIME_PATHS=(/ /shows /on-demand /articles /search?q=macro)
else
  docker compose -p "$PROJECT" up -d --build backend
  for i in $(seq 1 60); do
    if curl -fsS "http://localhost:${BACKEND_PORT}/api/v1/health" >/dev/null 2>&1; then
      echo "backend healthy"; break
    fi
    sleep 5
    [ "$i" -eq 60 ] && { echo "backend never became healthy"; exit 1; }
  done
  K6_SCRIPT="scenarios.js"
  TARGET_ENV=(-e BASE_URL="http://host.docker.internal:${BACKEND_PORT}")
  # Prime the API endpoints once (warm JIT + Caffeine + Lucene) before measuring.
  PRIME_BASE="http://localhost:${BACKEND_PORT}/api/v1"
  PRIME_PATHS=(/shows /on-demand/categories /articles /home /schedule /ticker /search?q=macro)
fi

# Path priming: hit each endpoint/page a few times so the first measured request
# isn't a cold-start outlier. Cheap, and complements the k6 warm-up scenario.
for _ in 1 2 3; do
  for p in "${PRIME_PATHS[@]}"; do
    curl -fsS -o /dev/null "${PRIME_BASE}${p}" 2>/dev/null || true
  done
done

chmod +x perf/sample-stats.sh
perf/sample-stats.sh perf/results/stats.csv 2 "$PROJECT" &
SAMPLER=$!

set +e
docker run --rm --add-host=host.docker.internal:host-gateway \
  --user "$HOST_UID:$HOST_GID" \
  -v "$PWD/perf:/perf" -w /perf \
  "${TARGET_ENV[@]}" \
  -e VUS -e RAMP -e DURATION -e WARMUP -e THINK_MIN -e THINK_MAX \
  grafana/k6 run "$K6_SCRIPT"
K6_RC=$?
set -e

kill "$SAMPLER" 2>/dev/null || true
sleep 1
echo "k6 exit code: $K6_RC"

# k6's handleSummary must have produced the report; if not, fail loudly here
# rather than with a cryptic ENOENT inside compare.mjs.
if [ ! -f perf/results/summary.json ]; then
  echo "ERROR: k6 did not write results/summary.json (see k6 output above)"; exit 1
fi

# Distill into a compact, comparable record (Node ships in the k6 image? no —
# use a small node container against the mounted perf dir).
docker run --rm --user "$HOST_UID:$HOST_GID" -v "$PWD/perf:/perf" -w /perf node:20-alpine \
  node compare.mjs record \
    --k6 results/summary.json --stats results/stats.csv \
    --label "${LABEL:-run}" --ref "${REF:-}" --out results/perf-record.json

# Report is the deliverable; a threshold breach here doesn't fail the job.
exit 0
