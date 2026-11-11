# ---------- build stage ----------
FROM node:22-alpine AS builder

# Variable publique injectée à la compilation, jamais un secret.
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- production stage ----------
FROM nginx:1.27-alpine AS production
RUN apk add --no-cache ca-certificates

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template
COPY security-headers.conf /etc/nginx/security-headers.conf
COPY nginx-env.envsh /docker-entrypoint.d/10-validate-env.envsh
RUN chmod 755 /docker-entrypoint.d/10-validate-env.envsh

# La valeur par défaut préserve Docker Compose ; sur Render, renseigner
# explicitement l'origine interne ou HTTPS publique du service backend.
ENV API_UPSTREAM_ORIGIN=http://backend:3000 \
    PORT=80 \
    NGINX_ENVSUBST_FILTER='^(PORT|API_UPSTREAM_ORIGIN|DNS_RESOLVER)$'

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD wget -qO- "http://127.0.0.1:${PORT}/" >/dev/null || exit 1

CMD ["nginx", "-g", "daemon off;"]
