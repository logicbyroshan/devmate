# 🚀 Native Linux VPS Production Deployment Guide (No Docker)

Complete step-by-step production deployment guide for deploying **DevMate Portfolio (Django REST Framework Backend + Vite React Frontend)** on an **Ubuntu 22.04 / 24.04 LTS Linux VPS** with **Nginx**, **Gunicorn**, **PostgreSQL**, and **Let's Encrypt SSL**.

---

## 📋 Architecture Overview

```text
               Internet (Clients & Visitors)
                           │
                 [443 HTTPS / 80 HTTP]
                           ▼
               ┌───────────────────────┐
               │    Nginx Web Server   │
               └───────────┬───────────┘
                           │
       ┌───────────────────┼───────────────────┐
       ▼                   ▼                   ▼
┌──────────────┐   ┌──────────────┐   ┌─────────────────┐
│ /static/     │   │ /media/      │   │ /api/ & /admin/ │
│ /var/www/... │   │ /var/www/... │   │ unix socket     │
└──────────────┘   └──────────────┘   └────────┬────────┘
                                               ▼
                                      ┌─────────────────┐
                                      │ Gunicorn WSGI   │
                                      │ (systemd svc)   │
                                      └────────┬────────┘
                                               ▼
                                      ┌─────────────────┐
                                      │ Django Backend  │
                                      └────────┬────────┘
                                               ▼
                                      ┌─────────────────┐
                                      │ PostgreSQL DB   │
                                      └─────────────────┘
```

---

## 🛠️ Prerequisites & Domain Setup

Ensure you have:
1. An **Ubuntu 22.04 or 24.04 LTS** VPS (e.g., DigitalOcean, Hetzner, AWS EC2, Linode, Hostinger).
2. Root / sudo access.
3. Domain DNS records configured:
   - `A` record: `logicbyroshan.in` $\rightarrow$ `YOUR_VPS_IP`
   - `A` record: `www.logicbyroshan.in` $\rightarrow$ `YOUR_VPS_IP`
   - `A` record: `admin.logicbyroshan.in` $\rightarrow$ `YOUR_VPS_IP`

---

## 1️⃣ System Update & Package Installation

Log into your VPS as `root` or a `sudo` user:

```bash
sudo apt update && sudo apt upgrade -y

# Install essential build tools, Python, PostgreSQL, and Nginx
sudo apt install -y python3-pip python3-venv python3-dev \
    libpq-dev postgresql postgresql-contrib \
    nginx curl git ufw certbot python3-certbot-nginx
```

---

## 2️⃣ Configure PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# Run SQL commands inside psql:
CREATE DATABASE portfolio_db;
CREATE USER portfolio_user WITH PASSWORD 'YOUR_SUPER_STRONG_PASSWORD_HERE';
ALTER ROLE portfolio_user SET client_encoding TO 'utf8';
ALTER ROLE portfolio_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE portfolio_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE portfolio_db TO portfolio_user;
ALTER DATABASE portfolio_db OWNER TO portfolio_user;
\q
```

---

## 3️⃣ Deploy Application Code & Virtual Environment

Create a dedicated deploy directory:

```bash
# Create web directory
sudo mkdir -p /var/www/devmate
sudo chown -R $USER:$USER /var/www/devmate

# Clone repository
git clone https://github.com/logicbyroshan/devmate-portfolio.git /var/www/devmate
cd /var/www/devmate/server

# Create Python Virtual Environment
python3 -m venv venv
source venv/bin/activate

# Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 4️⃣ Configure Production Environment Variables

Create and edit `/var/www/devmate/server/.env`:

```bash
cp .env.production.example .env
nano .env
```

Set your production values:

```ini
# Django core
DJANGO_SECRET_KEY=generate_a_long_50_char_random_key_here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=logicbyroshan.in,www.logicbyroshan.in,admin.logicbyroshan.in

# API & External Keys
PORTFOLIO_API_KEY=
TINYMCE_API_KEY=your_tinymce_key_or_no-api-key
HUGGINGFACE_API_KEY=your_optional_hf_token

# Domain Configuration
PUBLIC_SITE_DOMAIN=logicbyroshan.in
ADMIN_SITE_DOMAIN=admin.logicbyroshan.in

# PostgreSQL Configuration
DB_ENGINE=django.db.backends.postgresql
DB_NAME=portfolio_db
DB_USER=portfolio_user
DB_PASSWORD=YOUR_SUPER_STRONG_PASSWORD_HERE
DB_HOST=127.0.0.1
DB_PORT=5432

# Database Performance Knobs
DB_CONN_MAX_AGE=60
DB_CONN_HEALTH_CHECKS=True
DB_CONNECT_TIMEOUT=10
DB_STATEMENT_TIMEOUT_MS=15000
DISALLOW_SQLITE_IN_PRODUCTION=True

# CORS & CSRF
CORS_ALLOWED_ORIGINS=https://logicbyroshan.in,https://www.logicbyroshan.in,https://admin.logicbyroshan.in
CORS_ALLOW_CREDENTIALS=False
CORS_ALLOWED_METHODS=GET,POST,OPTIONS
CSRF_TRUSTED_ORIGINS=https://logicbyroshan.in,https://www.logicbyroshan.in,https://admin.logicbyroshan.in

# Security Headers & SSL
SECURE_SSL_REDIRECT=True
SESSION_COOKIE_SECURE=True
CSRF_COOKIE_SECURE=True
SESSION_COOKIE_SAMESITE=Lax
CSRF_COOKIE_SAMESITE=Lax
SECURE_HSTS_SECONDS=31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS=True
SECURE_HSTS_PRELOAD=True
SECURE_REFERRER_POLICY=strict-origin-when-cross-origin
SECURE_CROSS_ORIGIN_OPENER_POLICY=same-origin
SECURE_CROSS_ORIGIN_RESOURCE_POLICY=same-origin
X_FRAME_OPTIONS=DENY
USE_X_FORWARDED_HOST=True
TRUST_X_FORWARDED_PROTO=True
TRUST_X_FORWARDED_FOR=True
```

Run migrations, seed data, and collect static files:

```bash
# Run migrations
python manage.py migrate

# Create initial admin user
python manage.py createsuperuser

# Add initial achievement categories (optional)
python manage.py add_achievement_categories

# Collect static files into staticfiles/
python manage.py collectstatic --noinput
```

---

## 5️⃣ Build Frontend Assets (Vite React)

Install Node.js 20+ LTS on the VPS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

cd /var/www/devmate/client
npm install
npm run build
```

---

## 6️⃣ Configure Gunicorn & Systemd Service

Create Gunicorn systemd socket and service files to manage the Django application automatically.

### A. Create Gunicorn Socket
```bash
sudo nano /etc/systemd/system/gunicorn.socket
```

Paste:
```ini
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/run/gunicorn.sock

[Install]
WantedBy=sockets.target
```

### B. Create Gunicorn Service
```bash
sudo nano /etc/systemd/system/gunicorn.service
```

Paste *(adjust User/Group if not using root/ubuntu)*:
```ini
[Unit]
Description=gunicorn daemon for DevMate Portfolio
Requires=gunicorn.socket
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/devmate/server
ExecStart=/var/www/devmate/server/venv/bin/gunicorn \
          --access-logfile /var/log/gunicorn/access.log \
          --error-logfile /var/log/gunicorn/error.log \
          --workers 3 \
          --bind unix:/run/gunicorn.sock \
          config.wsgi:application

Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Create log directory and set permissions:
```bash
sudo mkdir -p /var/log/gunicorn
sudo chown -R www-data:www-data /var/log/gunicorn
sudo chown -R www-data:www-data /var/www/devmate/server/media
sudo chown -R www-data:www-data /var/www/devmate/server/staticfiles

# Start and enable Gunicorn socket
sudo systemctl daemon-reload
sudo systemctl start gunicorn.socket
sudo systemctl enable gunicorn.socket
sudo systemctl status gunicorn.socket
```

---

## 7️⃣ Configure Nginx Web Server

Create the Nginx site configuration:

```bash
sudo nano /etc/nginx/sites-available/devmate.conf
```

Paste the unified configuration:

```nginx
# Rate Limiting Zones
limit_req_zone $binary_remote_addr zone=api_limit:10m rate=30r/m;
limit_req_zone $binary_remote_addr zone=contact_limit:10m rate=10r/m;

# 1. Main Public Site (Vite Frontend + API Proxy)
server {
    server_name logicbyroshan.in www.logicbyroshan.in;

    root /var/www/devmate/client/dist;
    index index.html;

    # Static Assets Cache
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, no-transform, immutable";
    }

    # Media Files Uploaded via Django
    location /media/ {
        alias /var/www/devmate/server/media/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # Django Static Files
    location /static/ {
        alias /var/www/devmate/server/staticfiles/;
        expires 30d;
        add_header Cache-Control "public, no-transform";
    }

    # API Endpoints Proxy to Gunicorn
    location /api/ {
        limit_req zone=api_limit burst=20 nodelay;
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }

    location /api/v1/contact/ {
        limit_req zone=contact_limit burst=5 nodelay;
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }

    # Single Page Application Fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    client_max_body_size 25M;
}

# 2. Staff Admin Subdomain
server {
    server_name admin.logicbyroshan.in;

    location /static/ {
        alias /var/www/devmate/server/staticfiles/;
        expires 30d;
    }

    location /media/ {
        alias /var/www/devmate/server/media/;
        expires 30d;
    }

    location / {
        include proxy_params;
        proxy_pass http://unix:/run/gunicorn.sock;
    }

    client_max_body_size 25M;
}
```

Enable site and restart Nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/devmate.conf /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## 8️⃣ Secure with SSL (Let's Encrypt / Certbot)

```bash
# Obtain and install SSL certificates automatically
sudo certbot --nginx -d logicbyroshan.in -d www.logicbyroshan.in -d admin.logicbyroshan.in

# Verify auto-renewal timer
sudo systemctl status certbot.timer
```

---

## 9️⃣ Configure Linux Firewall (UFW)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

---

## 🔄 Routine Maintenance & Deployment Updates

When you push new updates to git:

```bash
cd /var/www/devmate
git pull origin main

# Update Backend
cd /var/www/devmate/server
source venv/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic --noinput
sudo systemctl restart gunicorn

# Update Frontend
cd /var/www/devmate/client
npm install
npm run build
sudo systemctl reload nginx
```

### Check Logs in Production
```bash
# Gunicorn Logs
sudo journalctl -u gunicorn -f
cat /var/log/gunicorn/error.log

# Nginx Logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```
