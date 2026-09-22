# 🚀 DevMate Portfolio — Production Deployment Architecture Guide

This document defines the production deployment architecture, container orchestration, web server configuration, and release procedures for **DevMate Portfolio (Standalone React / Vite SPA)**.

---

## 📑 Table of Contents
1. [Production System Architecture](#1-production-system-architecture)
2. [Domains & Endpoints Reference](#2-domains--endpoints-reference)
3. [Environment Configuration Reference](#3-environment-configuration-reference)
4. [Docker & Container Architecture](#4-docker--container-architecture)
5. [Host Nginx Reverse Proxy Configuration](#5-host-nginx-reverse-proxy-configuration)
6. [Cloudflare DNS & SSL Configuration](#6-cloudflare-dns--ssl-configuration)
7. [Local Development vs Production](#7-local-development-vs-production)
8. [Step-by-Step Server Deployment Procedure](#8-step-by-step-server-deployment-procedure)
9. [Zero-Downtime Rollback Procedure](#9-zero-downtime-rollback-procedure)
10. [Verification & Smoke Testing Checklist](#10-verification--smoke-testing-checklist)

---

## 1. Production System Architecture

```
                                  Cloudflare DNS & Edge
                                 (Flexible / Full Strict)
                                             │
                       ┌─────────────────────┴─────────────────────┐
                       │                                           │
                       ▼                                           ▼
             https://logicbyroshan.in                    https://devadmin-api.logicbyroshan.in
           https://www.logicbyroshan.in                            │
                       │                                           │
                       ▼                                           ▼
           Host Nginx Reverse Proxy                     DevAdmin Backend (Django API)
             (Ubuntu Host VPS)                                     │
                       │                                           ▼
                       ▼ Proxy Pass                           devadmin_db
                127.0.0.1:3080
                       │
                       ▼
        ┌─────────────────────────────┐
        │   devmate-frontend (Docker) │
        │      Nginx Alpine Runtime   │
        │    - Serves compiled dist/  │
        │    - Port 80 inside container│
        │    - Single Page Routing    │
        └─────────────────────────────┘
```

### Architectural Principles:
- **Client-Side Only**: DevMate has **NO backend, NO Node server runtime, NO database, and NO background workers** in production.
- **Direct API Communication**: Browser clients make direct HTTPS requests to `https://devadmin-api.logicbyroshan.in/api`. DevMate does NOT proxy API traffic.
- **Port Isolation**: DevMate runs inside Docker on `127.0.0.1:3080` (bound to localhost only, not exposed directly to the public internet). Host Nginx proxies traffic to it.

---

## 2. Domains & Endpoints Reference

| Purpose | Domain / Endpoint | Target Host / Destination | Notes |
|---|---|---|---|
| **Primary Website** | `https://www.logicbyroshan.in` | DevMate Frontend (Host Nginx → `127.0.0.1:3080`) | Public portfolio website |
| **Alternate Apex Domain** | `https://logicbyroshan.in` | DevMate Frontend (Host Nginx → `127.0.0.1:3080`) | Canonical URL origin |
| **Central Backend API** | `https://devadmin-api.logicbyroshan.in` | DevAdmin Django Backend | Centralized headless API |
| **API Base URL (in bundle)** | `https://devadmin-api.logicbyroshan.in/api` | DevAdmin REST endpoints | e.g. `/bootstrap/`, `/projects/` |

---

## 3. Environment Configuration Reference

Production environment variables are injected at build time via Docker build arguments:

| Variable | Production Value | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `https://devadmin-api.logicbyroshan.in/api` | Public DevAdmin REST API base URL |
| `VITE_API_TIMEOUT_MS` | `7000` | Client fetch abort timeout threshold (ms) |
| `VITE_API_RETRY_ATTEMPTS` | `1` | Retries on network/transient 5xx errors |
| `VITE_PORTFOLIO_CACHE_TTL_MS` | `300000` | Session cache duration for bootstrap payload (5 min) |

> [!IMPORTANT]
> `VITE_*` variables are compiled into static client-side JavaScript. **NEVER** include database credentials, private keys, or API secrets in Vite variables.

---

## 4. Docker & Container Architecture

DevMate uses a multi-stage Docker build producing an ultra-lightweight `nginx:alpine` runtime image (< 15MB RAM footprint):

### Build Stage (`node:20-alpine`)
- Installs dependencies deterministically via `npm ci`.
- Compiles the React SPA via `npm run build` using the production build args.

### Runtime Stage (`nginx:alpine`)
- Discards Node.js runtime and build toolchains.
- Copies compiled `dist/` artifacts to `/usr/share/nginx/html`.
- Applies custom `nginx.conf` with Gzip compression, immutability headers for `/assets/` and `/static/`, and `try_files` SPA fallback.

---

## 5. Host Nginx Reverse Proxy Configuration

On the host VPS, configure Nginx to route traffic to the containerized frontend:

```nginx
# /etc/nginx/sites-available/logicbyroshan.in

server {
    listen 80;
    listen [::]:80;
    server_name logicbyroshan.in www.logicbyroshan.in;

    # Cloudflare / Let's Encrypt SSL certificate handling
    # (Managed via Certbot or Cloudflare Origin CA)

    access_log /var/log/nginx/devmate_access.log combined buffer=512k flush=1m;
    error_log /var/log/nginx/devmate_error.log warn;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Reverse proxy to DevMate Docker container
    location / {
        proxy_pass http://127.0.0.1:3080;
        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Disable buffering for fast response streaming
        proxy_buffering on;
        proxy_buffer_size 16k;
        proxy_buffers 8 16k;
    }
}
```

Enable the configuration:
```bash
sudo ln -sf /etc/nginx/sites-available/logicbyroshan.in /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 6. Cloudflare DNS & SSL Configuration

1. **DNS Records**:
   - `A` record: `logicbyroshan.in` pointing to VPS public IP (Proxied - Orange Cloud).
   - `CNAME` record: `www.logicbyroshan.in` pointing to `logicbyroshan.in` (Proxied - Orange Cloud).
   - `A`/`CNAME` record: `devadmin-api.logicbyroshan.in` pointing to VPS public IP (DevAdmin backend).
2. **SSL/TLS Mode**: Full (Strict) or Full.
3. **Always Use HTTPS**: Enabled.

---

## 7. Local Development vs Production

| Aspect | Local Development | Production |
|---|---|---|
| **Server** | Vite Dev Server (`npm run dev`) on `localhost:5173` | Nginx Alpine in Docker on `127.0.0.1:3080` |
| **API Base URL** | `VITE_API_BASE_URL=/api` | `VITE_API_BASE_URL=https://devadmin-api.logicbyroshan.in/api` |
| **API Proxy** | Vite dev proxy forwards `/api` → `http://127.0.0.1:8000` | Direct client-to-API HTTPS requests (no proxy) |
| **Build Artifacts** | In-memory HMR | Static compiled `dist/` bundle |

---

## 8. Step-by-Step Server Deployment Procedure

When deploying updates to the VPS:

```bash
# 1. Navigate to project directory
cd /opt/devmate

# 2. Pull latest release from main branch
git pull origin main

# 3. Build container with production API endpoint
docker compose build --no-cache

# 4. Start/Restart frontend container
docker compose up -d

# 5. Verify container health
docker compose ps
curl -I http://127.0.0.1:3080/
```

---

## 9. Zero-Downtime Rollback Procedure

If a deployed build exhibits an issue, roll back instantly:

```bash
# 1. Roll back to previous Git commit or tag
git checkout <PREVIOUS_STABLE_COMMIT_OR_TAG>

# 2. Rebuild and start container
docker compose build
docker compose up -d

# 3. Verify health
curl -I http://127.0.0.1:3080/
```

---

## 10. Verification & Smoke Testing Checklist

- [ ] `npm test`: All unit tests pass.
- [ ] `npm run lint`: 0 ESLint warnings.
- [ ] `npm run build`: Production bundle compiles cleanly.
- [ ] Direct route navigation works (`/`, `/about`, `/experience`, `/projects/cardflow`, `/blog/understanding-microservices-architecture`).
- [ ] Browser Network tab shows API requests reaching `https://devadmin-api.logicbyroshan.in/api/bootstrap/`.
- [ ] Zero requests to `admin.logicbyroshan.in` or `localhost:8000`.
- [ ] Empty state resiliency functions if API is offline.
