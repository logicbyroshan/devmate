# 🚀 Production Deployment & Branch Strategy Guide

Comprehensive, production-grade deployment guide for **DevMate Portfolio (Vite React Frontend + Django REST Framework Backend)**.

---

## 📑 Table of Contents
1. [Git Branch Strategy & Workflow](#1-git-branch-strategy--workflow)
2. [Architecture Overview](#2-architecture-overview)
3. [Environment Configuration Reference](#3-environment-configuration-reference)
4. [Frontend Deployment (Vite React SPA)](#4-frontend-deployment-vite-react-spa)
   - [Option A: Vercel / Netlify / Cloudflare Pages](#option-a-vercel--netlify--cloudflare-pages)
   - [Option B: Ubuntu VPS Nginx Static Hosting](#option-b-ubuntu-vps-nginx-static-hosting)
5. [Backend Deployment (Django REST Framework)](#5-backend-deployment-django-rest-framework)
   - [System Setup & PostgreSQL](#system-setup--postgresql)
   - [Python Virtual Environment & Migrations](#python-virtual-environment--migrations)
   - [Gunicorn WSGI & Systemd Service](#gunicorn-wsgi--systemd-service)
   - [Celery & Redis Background Worker](#celery--redis-background-worker)
   - [Nginx Reverse Proxy & SSL (Let's Encrypt)](#nginx-reverse-proxy--ssl-lets-encrypt)
6. [Alternative PaaS Deployment (Render / Railway)](#6-alternative-paas-deployment-render--railway)
7. [Automated Deployment Script (Zero-Downtime)](#7-automated-deployment-script-zero-downtime)
8. [Post-Deployment Verification & Health Checks](#8-post-deployment-verification--health-checks)

---

## 1. Git Branch Strategy & Workflow

This repository uses a strict two-branch release engineering model:

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

### Branch Responsibilities:
- **`main` (Production Branch)**:
  - Deployed directly to production infrastructure.
  - Contains **only** stable, tested, and optimized code.
  - No temporary scratch files, raw experimental scripts, or debug logs.
  - Every commit on `main` is buildable with `npm run build` and zero errors.
- **`dev` (Development Branch)**:
  - Default branch for active development, new components, and experimental integrations.
  - Developers work here or branch out (`git checkout -b feature/awesome-feature dev`).
  - Staging tests and review occur before merging into `main`.

### Git Workflow Commands:
```bash
# 1. Switch to development branch for everyday coding
git checkout dev

# 2. Make your improvements, test locally
npm test
npm run build

# 3. Commit to dev
git add .
git commit -m "feat: added new case study components"
git push origin dev

# 4. When ready for production deployment:
git checkout main
git merge dev
git push origin main
# (Your CI/CD or production server webhook pulls from main)
```

---

## 2. Architecture Overview

```text
                        Clients (Web / Mobile / Desktop)
                                       │
                         [HTTPS : 443 / HTTP : 80]
                                       ▼
                     ┌───────────────────────────────────┐
                     │         Nginx Reverse Proxy       │
                     └─────────────────┬─────────────────┘
                                       │
            ┌──────────────────────────┼──────────────────────────┐
            ▼                          ▼                          ▼
 ┌────────────────────┐     ┌────────────────────┐     ┌────────────────────┐
 │   Vite React SPA   │     │   Django REST API  │     │   Static & Media   │
 │   /var/www/client  │     │   Gunicorn Socket  │     │   /static & /media │
 └────────────────────┘     └──────────┬─────────┘     └────────────────────┘
                                       │
                        ┌──────────────┴──────────────┐
                        ▼                             ▼
             ┌────────────────────┐        ┌────────────────────┐
             │   PostgreSQL DB    │        │    Redis & Celery  │
             │   (Data Storage)   │        │   (Async Workers)  │
             └────────────────────┘        └────────────────────┘
```

---

## 3. Environment Configuration Reference

### Client Environment (`client/.env.production`):
```ini
# Production API endpoint (leave empty for same-domain reverse proxy)
VITE_API_URL=https://logicbyroshan.in/api
VITE_ENABLE_REXI_AI=true
```

### Server Environment (`server/.env.production`):
```ini
# Core Security
DEBUG=False
DJANGO_SECRET_KEY=CHANGE_THIS_TO_A_64_CHAR_RANDOM_SECURE_KEY
ALLOWED_HOSTS=logicbyroshan.in,www.logicbyroshan.in,api.logicbyroshan.in,127.0.0.1,localhost

# Database (PostgreSQL)
DATABASE_URL=postgres://portfolio_user:SUPER_STRONG_PASSWORD@localhost:5432/portfolio_db

# Cache & Message Broker (Redis)
REDIS_URL=redis://127.0.0.1:6379/1
CELERY_BROKER_URL=redis://127.0.0.1:6379/0

# CORS & CSRF Trusted Origins
CORS_ALLOWED_ORIGINS=https://logicbyroshan.in,https://www.logicbyroshan.in
CSRF_TRUSTED_ORIGINS=https://logicbyroshan.in,https://www.logicbyroshan.in

# Email Configuration (Optional - for contact form dispatches)
EMAIL_BACKEND=django.core.mail.backends.smtp.EmailBackend
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=your_app_password
DEFAULT_FROM_EMAIL=Roshan Damor <mail@logicbyroshan.in>
```

---

## 4. Frontend Deployment (Vite React SPA)

### Option A: Vercel / Netlify / Cloudflare Pages

1. **Root Directory**: `client`
2. **Build Command**: `npm run build`
3. **Output Directory**: `dist`
4. **Environment Variables**: Add `VITE_API_URL` pointing to your backend.

#### SPA Routing Fallback (`client/public/_redirects` for Netlify / Cloudflare):
```text
/*    /index.html   200
```

#### SPA Routing Fallback (`client/vercel.json` for Vercel):
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

### Option B: Ubuntu VPS Nginx Static Hosting

Build the production bundle and copy to Nginx web root:

```bash
cd /var/www/devmate/client
npm install
npm run build

# Copy build to Nginx serving directory
sudo rm -rf /var/www/html/dist
sudo cp -r dist /var/www/html/
```

---

## 5. Backend Deployment (Django REST Framework)

### System Setup & PostgreSQL

On your **Ubuntu 22.04/24.04 LTS VPS**:

```bash
# 1. Update system packages
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv python3-dev \
    libpq-dev postgresql postgresql-contrib \
    nginx curl git ufw redis-server certbot python3-certbot-nginx

# 2. Configure PostgreSQL
sudo -u postgres psql
```

Inside `psql`:
```sql
CREATE DATABASE portfolio_db;
CREATE USER portfolio_user WITH PASSWORD 'YOUR_SUPER_STRONG_PASSWORD';
ALTER ROLE portfolio_user SET client_encoding TO 'utf8';
ALTER ROLE portfolio_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE portfolio_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;
ALTER DATABASE portfolio_db OWNER TO portfolio_user;
\q
```

---

### Python Virtual Environment & Migrations

```bash
# 1. Clone repository (main branch)
sudo mkdir -p /var/www/devmate
sudo chown -R $USER:$USER /var/www/devmate
git clone -b main https://github.com/logicbyroshan/devmate-portfolio.git /var/www/devmate

# 2. Create Python virtual environment
cd /var/www/devmate/server
python3 -m venv .venv
source .venv/bin/activate

# 3. Install requirements
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn psycopg2-binary redis celery

# 4. Setup production .env
cp .env.production.example .env
nano .env  # Enter your real secrets and PostgreSQL credentials

# 5. Run database migrations and collect static files
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py populate_data  # (Optional: seeds initial portfolio records)
```

---

### Gunicorn WSGI & Systemd Service

Create `/etc/systemd/system/gunicorn.service`:
```ini
[Unit]
Description=Gunicorn daemon for DevMate Portfolio Django Backend
After=network.target

[Service]
User=ubuntu
Group=www-data
WorkingDirectory=/var/www/devmate/server
ExecStart=/var/www/devmate/server/.venv/bin/gunicorn \
          --access-logfile - \
          --workers 3 \
          --bind unix:/run/gunicorn.sock \
          config.wsgi:application

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Enable and start Gunicorn:
```bash
sudo systemctl daemon-reload
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
sudo systemctl status gunicorn
```

---

### Celery & Redis Background Worker

Create `/etc/systemd/system/celery.service`:
```ini
[Unit]
Description=Celery Worker for DevMate Portfolio
After=network.target redis-server.service

[Service]
Type=forking
User=ubuntu
Group=ubuntu
WorkingDirectory=/var/www/devmate/server
EnvironmentFile=/var/www/devmate/server/.env
ExecStart=/var/www/devmate/server/.venv/bin/celery -A config worker --loglevel=INFO --detach
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start Celery:
```bash
sudo systemctl daemon-reload
sudo systemctl start celery
sudo systemctl enable celery
```

---

### Nginx Reverse Proxy & SSL (Let's Encrypt)

Create `/etc/nginx/sites-available/devmate`:
```nginx
server {
    listen 80;
    server_name logicbyroshan.in www.logicbyroshan.in;

    # Maximum file upload size for project thumbnails / screenshots (100MB)
    client_max_body_size 100M;
    client_body_buffer_size 128k;

    # Proxy timeouts for large uploads
    proxy_connect_timeout 300s;
    proxy_send_timeout 300s;
    proxy_read_timeout 300s;

    # Gzip Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript image/svg+xml;

    # 1. Frontend SPA static files
    location / {
        root /var/www/devmate/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # 2. Django Admin, Staff Dashboard & API Reverse Proxy
    location ~ ^/(api|admin|projects|experience|skills|achievements|categories|details)/ {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
        proxy_set_header X-Forwarded-Proto https;
        client_max_body_size 100M;
    }

    # 3. Django Static files
    location /static/ {
        alias /var/www/devmate/server/static/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # 4. User-uploaded Media files
    location /media/ {
        alias /var/www/devmate/server/media/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }
}
```

Enable site and configure SSL:
```bash
sudo ln -s /etc/nginx/sites-available/devmate /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

# Obtain free SSL Certificate
sudo certbot --nginx -d logicbyroshan.in -d www.logicbyroshan.in
```

---

## 6. Alternative PaaS Deployment (Render / Railway)

### Render (Free/Paid Managed Hosting)
1. **Frontend (Static Site)**:
   - Build Command: `cd client && npm install && npm run build`
   - Publish Directory: `client/dist`
   - Rewrite rule: `/*` $\to$ `/index.html` (Rewrite)
2. **Backend (Web Service)**:
   - Environment: `Python 3`
   - Build Command: `cd server && pip install -r requirements.txt && python manage.py collectstatic --noinput && python manage.py migrate`
   - Start Command: `cd server && gunicorn config.wsgi:application`

---

## 7. Automated Deployment Script (Zero-Downtime)

Save this script on your VPS as `/var/www/devmate/deploy.sh`:

```bash
#!/bin/bash
set -e

echo "🚀 Starting DevMate Deployment..."

# 1. Pull latest production code
cd /var/www/devmate
git fetch origin
git checkout main
git pull origin main

# 2. Build Frontend
echo "📦 Building React client..."
cd /var/www/devmate/client
npm install --silent
npm run build

# 3. Update Backend dependencies & migrations
echo "🐍 Updating Django server..."
cd /var/www/devmate/server
source .venv/bin/activate
pip install -r requirements.txt --quiet
python manage.py migrate --noinput
python manage.py collectstatic --noinput

# 4. Restart Services
echo "🔄 Reloading Gunicorn & Celery..."
sudo systemctl restart gunicorn
sudo systemctl restart celery
sudo systemctl reload nginx

echo "✅ Deployment completed successfully!"
```

Make it executable:
```bash
chmod +x /var/www/devmate/deploy.sh
```

---

## 8. Post-Deployment Verification & Health Checks

After deployment, verify the following checks:

| Target | Test Command / URL | Expected Result |
| :--- | :--- | :--- |
| **Frontend Root** | `curl -I https://logicbyroshan.in/` | `HTTP/2 200` |
| **SPA Route** | `curl -I https://logicbyroshan.in/projects/cardflow` | `HTTP/2 200` |
| **API Health** | `curl https://logicbyroshan.in/api/v1/portfolio/` | `JSON 200 OK` |
| **Admin Panel** | `https://logicbyroshan.in/admin/` | Secure Login Screen |
| **SSL Certificate** | `https://www.ssllabs.com/ssltest/` | Grade A+ |
| **Mobile Layout** | Chrome DevTools Responsive Mode | Flawless 320px–768px rendering |

---

*Engineered with precision for Roshan Damor Portfolio Platform.*
