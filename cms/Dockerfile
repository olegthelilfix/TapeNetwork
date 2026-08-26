# ---- build ----
FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_ADMIN_API_URL
ENV VITE_ADMIN_API_URL=$VITE_ADMIN_API_URL
COPY package.json package-lock.json* ./
RUN npm install
COPY . .
RUN npm run build

# ---- serve (static) ----
FROM nginx:1.27-alpine AS run
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
