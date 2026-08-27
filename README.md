# DevMate — Roshan Damor | Software Engineer Portfolio

<div align="center">

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Django](https://img.shields.io/badge/Django-5.0+-092E20?style=for-the-badge&logo=django&logoColor=white)](https://www.djangoproject.com/)
[![React](https://img.shields.io/badge/React-18.3+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16+-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-7.0+-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)](#)

<p align="center">
  <b>A production-grade, highly performant personal portfolio and engineering showcase.</b><br>
  Built with a <b>Django REST API</b> backend, a <b>React + Vite</b> client, dynamic DOM hydration, interactive full-page case studies, a built-in AI Assistant (Rexi), custom Web Audio SFX engine, and complete responsive design.
</p>

[🌐 Live Portfolio](https://logicbyroshan.in) • [🚀 Featured Projects](#-featured-projects) • [📡 API Reference](#-rest-api-reference) • [🛠️ Setup Guide](#-quick-start--installation)

</div>

---

## 🌟 Highlights & Key Engineering Features

- ⚡ **Ultra-Fast Hybrid Hydration**: React SPA client bootstraps static HTML instantly (`dangerouslySetInnerHTML`), then seamlessly hydrates dynamic content via `/api/bootstrap/` without layout shift.
- 🪪 **Deep Engineering Case Studies**: Interactive modals with system design flowcharts, architecture diagrams, technical tables, and ASCII workflows for hero SaaS projects like **CardFlow** and **VidyaMaxx**.
- 🐉 **Rexi AI Assistant**: Mascot & intelligent interactive assistant powered by Qwen AI with fallback intent matching for skills, experience, and tech inquiries.
- 🔊 **Custom Web Audio Engine**: Procedural synthesizers for UI clicks, slide transitions, modal pops, and optional ambient background music with state persistence.
- 📱 **100% Mobile Responsive**: Comprehensive media queries optimized down to 320px screens with zero horizontal overflow, touch-friendly navigation, and adaptive modals.
- 🛡️ **Production-Hardened Django Backend**: Granular CORS, rate limiting (100 req/hr anon, 1000 req/hr auth), optimized queries with prefetching, security headers, and data fixtures.

---

## 🏗️ System Architecture

```
                               ┌────────────────────────────────────────┐
                               │           Client (Browser)             │
                               │   React 18 + Vite 5 + Vanilla CSS      │
                               └──────────────────┬─────────────────────┘
                                                  │
                              HTTP / REST API     │   Web Audio SFX
                             (/api/bootstrap/)    │   Session Storage
                                                  ▼
                               ┌────────────────────────────────────────┐
                               │       Django REST Framework (API)      │
                               │    Gunicorn + Nginx + CORS Filter      │
                               └─────────┬────────────────────┬─────────┘
                                         │                    │
                          ORM Queries    │                    │ Cache / Tasks
                                         ▼                    ▼
                               ┌──────────────────┐  ┌──────────────────┐
                               │    PostgreSQL    │  │  Redis + Celery  │
                               │  Primary Storage │  │ Background Jobs  │
                               └──────────────────┘  └──────────────────┘
```

### Folder Structure

```
DevMate/
├── client/                              # React + Vite Frontend
│   ├── public/
│   │   ├── static/
│   │   │   ├── css/                     # Component styles (modal, roadmap, projects, etc.)
│   │   │   ├── js/                      # Interactive legacy modules (sounds, modal, faq)
│   │   │   └── images/                  # Optimized WebP assets & project banners
│   │   └── portfolio-bgm.mp3            # Ambient background audio track
│   └── src/
│       ├── App.jsx                      # Root container & script lifecycle manager
│       ├── portfolio-body.html          # Core static HTML markup template
│       └── api/
│           ├── portfolioApi.js          # REST client (/api/bootstrap/)
│           └── hydratePortfolio.js     # DOM hydration & case study injector
│
└── server/                              # Django Backend
    ├── config/                          # Project settings, URLs, WSGI/ASGI
    │   ├── settings.py                  # Database, CORS, rate limits, apps
    │   └── urls.py                      # Root routing & admin endpoints
    ├── media/
    │   └── projects/thumbnails/         # Optimized WebP thumbnails
    └── portfolio/                       # Portfolio core application
        ├── models.py                    # Project, Experience, Skill, UserProfile models
        ├── serializers.py               # DRF serializers with computed fields
        ├── api_views.py                 # Read-only REST viewsets & bootstrap endpoint
        └── fixtures/
            └── initial_data.json        # Complete UTF-8 database seed fixture
```

---

## 🚀 Featured Projects

| Project | Category | Tech Stack | Status | Repository / Link |
|---|---|---|---|---|
| **CardFlow** | Enterprise SaaS | Django, React, PostgreSQL, Redis, Celery | 🟢 Production (1K+ Users) | [GitHub](https://github.com/logicbyroshan/cardfloww-idcard-management-saas.git) • [cardflow.in](https://cardflow.in) |
| **VidyaMaxx** | AI-First SaaS | Django, React, PostgreSQL, Redis, AI Workflows | 🟡 Pilot Testing | [GitHub](https://github.com/logicbyroshan/vidyamaxx-school-management-saas.git) |
| **PrintNexx** | Engineering Tool | Python, OpenCV, Image Processing, Automation | 🟢 Active Internal Tool | Private |
| **EazeTrip** | Client Project | Django, React, PostgreSQL, REST API, AI | 🟢 Production | [Live](https://logicbyroshan.in/#projects) |
| **TaskFlixx** | AI Productivity | Django, React, PostgreSQL, AI, REST API | 🟢 Live / Open Source | [GitHub](https://github.com/logicbyroshan) |
| **PrepSarthi** | AI Learning | Python, Django, React, PostgreSQL, AI | 🔵 Open Source | [GitHub](https://github.com/logicbyroshan) |

---

## 💼 Experience Timeline

| Period | Role | Organization | Core Focus |
|---|---|---|---|
| **Dec 2025 – Present** | **Software Engineer** | **Adarsh ID Cards** | Full-cycle engineering of CardFlow SaaS (Django, React, Celery, PostgreSQL, Electron, RBAC, 1,000+ real users). |
| **Apr 2025 – May 2025** | **Graphic Designer Intern** | **Miracle Organisation** | Branding systems, visual design, typography, posters, banners, and digital marketing campaign collateral. |

---

## 📡 REST API Reference

Base URL (Local): `http://127.0.0.1:8000`  
Base URL (Production): `https://logicbyroshan.in`

### Endpoints Overview

| Endpoint | Method | Params / Payload | Description |
|---|---|---|---|
| `/api/bootstrap/` | `GET` | — | **Single-Call Bootstrap**: Returns Profile, Featured Projects, Skills, and Experience in one optimized payload. |
| `/api/projects/` | `GET` | `?category=slug&status=published` | List all active projects (paginated). |
| `/api/projects/featured/` | `GET` | — | Retrieve top featured projects (ordered by priority). |
| `/api/projects/{slug}/` | `GET` | — | Retrieve detailed project by slug. |
| `/api/experience/` | `GET` | — | Retrieve full work experience timeline ordered by date descending. |
| `/api/skills/` | `GET` | `?category=slug` | Retrieve skills categorized into engineering domains. |
| `/api/skills/top/` | `GET` | — | Top 10 skills by proficiency rating. |
| `/api/profile/` | `GET` | — | User profile information, social URLs, and SEO metadata. |
| `/api/contact/` | `POST` | JSON body (see below) | Anti-spam protected contact message submission. |
| `/api/health/` | `GET` | — | System health check (Database connectivity & API status). |

### Example: Bootstrap Response (`GET /api/bootstrap/`)

```json
{
  "profile": {
    "full_name": "Roshan Damor",
    "title": "Software Engineer",
    "email": "mail@logicbyroshan.in",
    "github": "https://github.com/logicbyroshan",
    "website": "https://logicbyroshan.in",
    "experience_years": 3,
    "open_to_opportunities": true
  },
  "projects": [
    {
      "id": 1,
      "title": "CardFlow",
      "project_name": "CardFlow",
      "category": { "name": "Enterprise SaaS" },
      "technologies_list": ["Django", "React", "PostgreSQL", "Redis", "Celery"],
      "thumbnail": "http://127.0.0.1:8000/media/projects/thumbnails/cardflow-banner.webp",
      "status": "published",
      "documentation": "<div class=\"case-study-container\">...</div>"
    }
  ],
  "experience": [
    {
      "position": "Software Engineer",
      "company_name": "Adarsh ID Cards",
      "duration": "Dec 2025 - Present",
      "currently_working": true
    }
  ]
}
```

### Example: Contact Submission (`POST /api/contact/`)

```bash
curl -X POST http://127.0.0.1:8000/api/contact/ \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Alex Johnson",
    "email": "alex@example.com",
    "message": "Interested in collaborating on a SaaS project.",
    "is_urgent": false
  }'
```

---

## 🛠️ Quick Start & Installation

### Prerequisites
- **Python 3.11+**
- **Node.js 18+** & **npm**
- **Git**

### 1. Clone Repository
```bash
git clone https://github.com/logicbyroshan/devmate-portfolio.git
cd devmate-portfolio
```

### 2. Backend Setup (Django)
```bash
cd server

# Create and activate virtual environment
python -m venv .venv
.venv\Scripts\activate       # On Windows PowerShell
# source .venv/bin/activate  # On Linux / macOS

# Install dependencies
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env

# Apply migrations & seed initial data
python manage.py migrate
python manage.py loaddata portfolio/fixtures/initial_data.json

# Start development server
python manage.py runserver 127.0.0.1:8000
```

### 3. Frontend Setup (React + Vite)
```bash
# In a new terminal tab
cd client

# Install packages
npm install

# Configure environment
cp .env.example .env

# Start Vite dev server
npm run dev
```

Visit **`http://localhost:5173`** in your browser.

---

## 🗃️ Database & Fixtures Workflow

Export updated database content to JSON fixtures with UTF-8 encoding:

```bash
cd server
.venv\Scripts\python.exe -c "
import os, django, json
os.environ['DJANGO_SETTINGS_MODULE'] = 'config.settings'
django.setup()
from django.core import serializers
from portfolio.models import Category, UserProfile, Skill, Experience, Achievement, Project

output = []
for model in [Category, UserProfile, Skill, Experience, Achievement, Project]:
    data = json.loads(serializers.serialize('json', model.objects.all()))
    output.extend(data)

with open('portfolio/fixtures/initial_data.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
print(f'Exported {len(output)} objects successfully.')
"
```

Reload fixtures into a fresh database:
```bash
python manage.py loaddata portfolio/fixtures/initial_data.json
```

---

## 🌿 Branch Strategy & Development Workflow

This project follows a professional release engineering model:

- **`main`**: **Production Deployment Branch** — strictly clean, verified, and always deployable. Production servers / CI pipelines track this branch.
- **`dev`**: **Active Development Branch** — used for active development, prototyping, and integrating new features before merging to `main`.

```bash
# Day-to-day development
git checkout dev

# Merging stable releases for deployment
git checkout main
git merge dev
git push origin main
```

---

## 🚀 Production Deployment

Complete step-by-step instructions for deploying to **Vercel, Netlify, Cloudflare Pages, Ubuntu VPS (Nginx + Gunicorn + PostgreSQL + Redis + Celery + Let's Encrypt SSL), and Docker/Render** are available in the dedicated deployment guide:

👉 **[Read the Full Production Deployment Guide (DEPLOYMENT.md)](DEPLOYMENT.md)**

---

## 🔒 Security & Performance Features

- **Read-Only Public API**: All write actions (except contact message POST) are restricted to authenticated admin sessions.
- **Strict CORS Policy**: Whitelisted origins only (`localhost:5173`, `logicbyroshan.in`).
- **Asset Optimization**: High-resolution banners converted to ultra-lightweight WebP, reducing initial bundle payload by >95%.
- **Single-Session Preloader**: Preloader animation plays once per browser session via `sessionStorage` and is bypassed instantaneously on refreshes.
- **N+1 Query Elimination**: Viewsets use `.select_related()` and `.prefetch_related()` for categories, images, and skills.

---

## 📄 License & Author

Crafted with ❤️ by **[Roshan Damor](https://logicbyroshan.in)**  
Licensed under the [MIT License](LICENSE).

