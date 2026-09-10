# ---- deps ----
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json yarn.lock* ./
# Private @dx-display/* packages live in Nexus. Mount the host .npmrc as a build
# secret so the token is available only for this step and never baked into a layer.
# Portable across podman & docker: the secret lands at /run/secrets/npmrc and yarn
# is pointed at it via NPM_CONFIG_USERCONFIG (podman ignores mount target=).
#   podman: podman build --secret id=npmrc,src=$HOME/.npmrc -t tapenetwork-web ./web
#   docker: DOCKER_BUILDKIT=1 docker build --secret id=npmrc,src=$HOME/.npmrc ...
RUN --mount=type=secret,id=npmrc,required=false \
    NPM_CONFIG_USERCONFIG=/run/secrets/npmrc yarn install --frozen-lockfile

# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
ARG NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_SITE_URL
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL
COPY --from=deps /app/node_modules ./node_modules
COPY ../packages/api-types/generated/user-openapi.json packages/api-types/generated/user-openapi.json
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
