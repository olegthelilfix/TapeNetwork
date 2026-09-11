# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock* ./
# Private @dx-display/* packages live in Nexus. We pass ONLY the auth token as a
# build secret (a short-lived token file, NOT the whole ~/.npmrc), assemble a
# minimal .npmrc from it inside this step, and delete it in the SAME layer — so
# nothing (token or npmrc) is ever written into an image layer.
# NOTE: podman/buildah secret mounts accept only id/target/required/mode/uid/gid
# (no env= — that is a docker-buildx-only flag), so the token is passed as a file.
#   podman: podman build --secret id=nexus_token,src=<token-file> -t tapenetwork-web ./web
#   docker: DOCKER_BUILDKIT=1 docker build --secret id=nexus_token,src=<token-file> ...
# required=false lets a public-only build (no private deps) still succeed.
RUN --mount=type=secret,id=nexus_token,required=false \
    if [ -s /run/secrets/nexus_token ]; then \
      printf '@dx-display:registry=https://nexus.in.devexperts.com/repository/candelabra-npm/\n//nexus.in.devexperts.com/repository/candelabra-npm/:_authToken=%s\n' \
        "$(cat /run/secrets/nexus_token)" > /root/.npmrc; \
    fi; \
    yarn install --frozen-lockfile; \
    rm -f /root/.npmrc

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STREAMER_URL
ENV NEXT_PUBLIC_STREAMER_URL=$NEXT_PUBLIC_STREAMER_URL
COPY --from=deps /app/node_modules ./node_modules
# user-openapi.json is staged into the web/ build context by the CI step
# ("Stage OpenAPI spec") before docker build, because COPY cannot reach
# outside the build context (../packages).
COPY packages/api-types/generated/user-openapi.json packages/api-types/generated/user-openapi.json
COPY . .
RUN yarn build

# ---- run (standalone) ----
FROM node:20-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000
COPY --from=build /app/public ./public
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]
