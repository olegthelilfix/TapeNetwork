#!/usr/bin/env bash
# Local one-command build+run of the whole stack.
#
# Why this script exists (vs a plain `podman compose up --build`):
#   1. The web image needs private @dx-display/* packages from Nexus. Those need a
#      Nexus auth token, which classic docker-compose (what `podman compose`
#      delegates to) does NOT forward as a build secret -> yarn hits Nexus
#      anonymously and fails 401. So web is built with a standalone
#      `podman build --secret ...` here, and compose only *runs* the pre-built image.
#      We pass ONLY the token (extracted from ~/.npmrc) via --secret env=, not the
#      whole npmrc file; the Dockerfile assembles a throwaway .npmrc from it.
#   2. web/Dockerfile COPYs packages/api-types/generated/user-openapi.json, which
#      must be staged INTO the web/ build context first (CI does the same in
#      deploy-vm.yml). We stage it, build, then remove it.
#
# Everything else (postgres, backend, cms, streamer) builds fine under compose.
#
# Usage:   ./dev-up.sh            # build web + up whole stack (foreground)
#          ./dev-up.sh -d         # ... detached
# Env:     NPMRC=/path/to/.npmrc  # where to read the Nexus token from (default: ~/.npmrc)
#          NEXUS_TOKEN=...        # pass the token directly instead of reading npmrc
#          public URL build-args are read from the same env compose uses.
set -euo pipefail
cd "$(dirname "$0")"

NPMRC="${NPMRC:-$HOME/.npmrc}"
WEB_IMAGE="localhost/tapenetwork-web:latest"
STAGED="web/packages/api-types/generated"

# Resolve the Nexus token: explicit NEXUS_TOKEN wins, else extract it from npmrc.
if [[ -z "${NEXUS_TOKEN:-}" ]]; then
  if [[ ! -f "$NPMRC" ]]; then
    echo "ERROR: no NEXUS_TOKEN set and npmrc not found at $NPMRC (need Nexus auth for @dx-display/*)." >&2
    exit 1
  fi
  NEXUS_TOKEN="$(sed -n 's#^//nexus\.in\.devexperts\.com/repository/candelabra-npm/:_authToken=##p' "$NPMRC" | head -n1)"
  if [[ -z "$NEXUS_TOKEN" ]]; then
    echo "ERROR: could not find the candelabra-npm _authToken in $NPMRC. Set NEXUS_TOKEN=... instead." >&2
    exit 1
  fi
fi
export NEXUS_TOKEN

# 1. stage the OpenAPI spec + write the token to a short-lived file (podman's
#    --secret needs src=<file>; env= is docker-buildx-only). Both are removed on
#    exit, even on failure.
TOKEN_FILE="$(mktemp)"
chmod 600 "$TOKEN_FILE"
printf '%s' "$NEXUS_TOKEN" > "$TOKEN_FILE"
cleanup() { rm -rf web/packages; rm -f "$TOKEN_FILE"; }
trap cleanup EXIT
mkdir -p "$STAGED"
cp packages/api-types/generated/user-openapi.json "$STAGED/"

# 2. build the web image, passing ONLY the Nexus token as a file secret
echo ">> building web image (Nexus token via --secret file) ..."
podman build \
  --secret "id=nexus_token,src=$TOKEN_FILE" \
  --build-arg "NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL:-http://localhost:8080}" \
  --build-arg "NEXT_PUBLIC_SITE_URL=${NEXT_PUBLIC_SITE_URL:-http://localhost:3000}" \
  --build-arg "NEXT_PUBLIC_STREAMER_URL=${NEXT_PUBLIC_STREAMER_URL:-http://localhost:8082}" \
  -t "$WEB_IMAGE" ./web

# 3. build the rest (NOT web — it's already built above with the secret), then up.
#    `up` without --build reuses images; web takes the tag built in step 2.
echo ">> building backend/cms/streamer ..."
WEB_IMAGE="$WEB_IMAGE" podman compose build backend cms streamer
echo ">> starting the whole stack ..."
WEB_IMAGE="$WEB_IMAGE" podman compose up "$@"
