#!/usr/bin/env bash
# Runs ON THE VM (piped over ssh stdin by the perf workflows). Expects these
# env vars set by the ssh command: DIR PROJECT BACKEND_PORT POSTGRES_PORT
# VUS RAMP DURATION REF [LABEL].
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

export BACKEND_PORT POSTGRES_PORT
docker compose -p "$PROJECT" up -d --build backend

# Wait for the API (build is slow on this VM).
for i in $(seq 1 60); do
  if curl -fsS "http://localhost:${BACKEND_PORT}/api/v1/health" >/dev/null 2>&1; then
    echo "backend healthy"; break
  fi
  sleep 5
  [ "$i" -eq 60 ] && { echo "backend never became healthy"; exit 1; }
done

chmod +x perf/sample-stats.sh
perf/sample-stats.sh perf/results/stats.csv 2 "$PROJECT" &
SAMPLER=$!

set +e
docker run --rm --add-host=host.docker.internal:host-gateway \
  --user "$HOST_UID:$HOST_GID" \
  -v "$PWD/perf:/perf" -w /perf \
  -e BASE_URL="http://host.docker.internal:${BACKEND_PORT}" \
  -e VUS -e RAMP -e DURATION \
  grafana/k6 run scenarios.js
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
