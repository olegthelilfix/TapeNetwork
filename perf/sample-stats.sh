#!/usr/bin/env bash
# Sample per-container CPU / memory into a CSV while a load test runs.
# Lazy on purpose: no Prometheus/cAdvisor — `docker stats` already reports
# everything we need "for a start" (CPU %, mem usage/limit, net/block I/O).
#
#   ./sample-stats.sh <out.csv> [interval_secs] [project_name]
#
# Runs until it receives SIGTERM/SIGINT (the workflow starts it in the
# background, runs k6, then kills it). Filters to one compose project when a
# project name is given, so a shared build host's other containers don't leak in.
set -uo pipefail

OUT="${1:-stats.csv}"
INTERVAL="${2:-2}"
PROJECT="${3:-}"

echo "ts,container,cpu_pct,mem_used,mem_limit,mem_pct,net_io,block_io" > "$OUT"

filter=()
[[ -n "$PROJECT" ]] && filter=(--filter "label=com.docker.compose.project=$PROJECT")

trap 'exit 0' TERM INT

fmt='{{.Name}},{{.CPUPerc}},{{.MemUsage}},{{.MemPerc}},{{.NetIO}},{{.BlockIO}}'
while true; do
  ts="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
  ids="$(docker ps -q "${filter[@]}")"
  [[ -z "$ids" ]] && { sleep "$INTERVAL"; continue; }
  # --no-stream = one snapshot; strip % and split "used / limit" into columns
  docker stats --no-stream --format "$fmt" $ids | while IFS=, read -r name cpu memusage mempct netio blockio; do
    memused="${memusage%% / *}"
    memlimit="${memusage##* / }"
    echo "$ts,$name,${cpu%\%},$memused,$memlimit,${mempct%\%},$netio,$blockio" >> "$OUT"
  done
  sleep "$INTERVAL"
done
