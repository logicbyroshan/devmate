# 🚀 DevMate Portfolio — Production Deployment Guide

Comprehensive, production-grade deployment guide for **DevMate Portfolio (Standalone Vite React SPA)**.

---

## 📑 Table of Contents
1. [Git Branch Strategy & Release Workflow](#1-git-branch-strategy--release-workflow)
2. [Architecture & Backend Connection](#2-architecture--backend-connection)
3. [Environment Configuration Reference](#3-environment-configuration-reference)
4. [Deployment Platforms](#4-deployment-platforms)
   - [Option A: Vercel](#option-a-vercel)
   - [Option B: Netlify](#option-b-netlify)
   - [Option C: Cloudflare Pages](#option-c-cloudflare-pages)
   - [Option D: Ubuntu VPS Nginx Static Hosting](#option-d-ubuntu-vps-nginx-static-hosting)
5. [Connecting to DevAdmin API](#5-connecting-to-devadmin-api)
6. [Automated Testing & Build Verification](#6-automated-testing--build-verification)

---

## 1. Git Branch Strategy & Release Workflow

This repository uses a strict release engineering model:

```text
 ┌─────────────────────────────────────────────────────────────┐
 │                         main                                │
 │     (Production Deployment Branch - Strictly Clean & Live)  │
 └──────────────────────────────▲──────────────────────────────┘
                                │
                    [Tested Release Merge / PR]
                                │
 ┌──────────────────────────────┴──────────────────────────────┐
 │                          dev                                │
 │        (Active Development & Feature Integration)           │
 └──────────────────────────────▲──────────────────────────────┘
                                │
                   [Feature & Bugfix Commits]
                                │
 ┌──────────────────────────────┴──────────────────────────────┐
 │                 feature/*  or  bugfix/*                     │
 └─────────────────────────────────────────────────────────────┘
```

### Git Workflow Commands:
```bash
# 1. Switch to development branch for everyday coding
git checkout dev

# 2. Make improvements & test locally
npm test
npm run lint
npm run build

# 3. Commit to dev
git add .
git commit -m "feat: added new case study components"
git push origin dev

# 4. When ready for production deployment:
gh pr create --base main --head dev --title "release: v1.0.0" --body "Production release"
gh pr merge --merge
```

---

## 2. Architecture & Backend Connection

`DevMate` is a **100% standalone frontend Single Page Application (SPA)**. It communicates with your backend via REST API calls to **DevAdmin**:

```text
┌─────────────────────────────────┐
│     DevMate (Client Browser)    │
│  React 18 + Vite 5 + Lenis      │
└────────────────┬────────────────┘
                 │ HTTPS REST API
                 ▼
┌─────────────────────────────────┐
│      DevAdmin Backend API       │
│  https://admin.logicbyroshan.in │
└─────────────────────────────────┘
```

If the API is unreachable, offline, or returns empty lists, `DevMate` automatically renders resilient, high-fidelity dark-mode glassmorphic empty states.

---

## 3. Environment Configuration Reference

Create `.env.production` in your hosting dashboard or local build environment:

```ini
# Base URL of DevAdmin public REST API
VITE_API_BASE_URL=https://admin.logicbyroshan.in/api

# API Request timeout threshold (milliseconds)
VITE_API_TIMEOUT_MS=7000

# Automatic retries on transient network failures
VITE_API_RETRY_ATTEMPTS=1

# Aggregated bootstrap payload session cache TTL (milliseconds)
VITE_PORTFOLIO_CACHE_TTL_MS=300000
```

---

## 4. Deployment Platforms

### Option A: Vercel
1. **Framework Preset**: `Vite`
2. **Root Directory**: `./`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Environment Variables**: Set `VITE_API_BASE_URL` to your DevAdmin API URL.

### Option B: Netlify
1. **Build Command**: `npm run build`
2. **Publish Directory**: `dist`
3. Ensure `public/_redirects` contains:
   ```text
   /*    /index.html   200
   ```

### Option C: Cloudflare Pages
1. **Framework**: `Vite`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**: Configure `VITE_API_BASE_URL`.

### Option D: Ubuntu VPS Nginx Static Hosting

```bash
# 1. Build production bundle
npm install
npm run build

# 2. Copy production bundle to web root
sudo mkdir -p /var/www/devmate
sudo cp -r dist/* /var/www/devmate/

# 3. Nginx Virtual Host Configuration (/etc/nginx/sites-available/devmate)
server {
    listen 80;
    listen [::]:80;
    server_name logicbyroshan.in www.logicbyroshan.in;

    root /var/www/devmate;
    index index.html;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml image/svg+xml;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Static asset aggressive caching
    location /static/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Assets hashed by Vite
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 5. Connecting to DevAdmin API

Ensure your **DevAdmin** Django backend has CORS configured to permit requests from your DevMate origin:

```python
# In DevAdmin settings.py
CORS_ALLOWED_ORIGINS = [
    "https://logicbyroshan.in",
    "https://www.logicbyroshan.in",
    "http://localhost:5173",
]
```

---

## 6. Automated Testing & Build Verification

Before deploying, run the complete validation suite:

```bash
npm test        # Vitest unit test suite (16 tests)
npm run lint    # ESLint verification (0 warnings)
npm run build   # Production Vite bundle build
```
