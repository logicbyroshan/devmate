# ============================================================
# DevMate Frontend — Multi-Stage Production Dockerfile
# Stage 1: Build static React / Vite bundle
# Stage 2: Serve static bundle via high-performance Nginx Alpine
# ============================================================

# ------------------------------------------------------------
# Stage 1: Build Environment
# ------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Install dependencies using deterministic package-lock.json
COPY package.json package-lock.json ./
RUN npm ci

# Pass build-time environment variables for Vite bundle compilation
ARG VITE_API_BASE_URL=https://devadmin-api.logicbyroshan.in/api
ARG VITE_API_TIMEOUT_MS=7000
ARG VITE_API_RETRY_ATTEMPTS=1
ARG VITE_PORTFOLIO_CACHE_TTL_MS=300000

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_API_TIMEOUT_MS=$VITE_API_TIMEOUT_MS
ENV VITE_API_RETRY_ATTEMPTS=$VITE_API_RETRY_ATTEMPTS
ENV VITE_PORTFOLIO_CACHE_TTL_MS=$VITE_PORTFOLIO_CACHE_TTL_MS

# Copy source files and compile production bundle
COPY . .
RUN npm run build

# ------------------------------------------------------------
# Stage 2: Minimalist Production Nginx Runtime
# ------------------------------------------------------------
FROM nginx:alpine AS runtime

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy compiled production artifacts from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose HTTP port 80 inside container
EXPOSE 80

# Healthcheck to ensure Nginx is actively serving traffic
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://127.0.0.1:80/ || exit 1

# Start Nginx in foreground mode
CMD ["nginx", "-g", "daemon off;"]
