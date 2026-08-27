# Server (Django Backend + DRF REST API + Staff Admin)

This folder hosts the Django backend that serves:
- **Modular Service Layer (`portfolio/services/`)**: High-performance business logic, query selectors, Rexi AI chat engine, contact message & spam protection, and atomic interaction counters.
- **REST API (`/api/v1/` & `/api/`)**: Versioned Django REST Framework APIs for client frontend hydration, project interactions, contact submissions, and AI assistant queries.
- **Staff Admin / Management Panel**: Template-based dashboard with responsive CRUD interfaces.
- **VPS Deployment Guide**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) for full native Linux VPS deployment instructions (Nginx, Gunicorn, PostgreSQL, SSL).

---

## 🚀 Local Setup & Development

```bash
cd server
python -m venv ../.venv
```

Windows PowerShell:
```powershell
& ..\.venv\Scripts\Activate.ps1
```

macOS/Linux:
```bash
source ../.venv/bin/activate
```

Install dependencies and start development server:
```bash
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
copy .env.example .env
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver 127.0.0.1:8000
```

---

## 🧪 Validation & Testing Commands

```bash
python manage.py check
python manage.py check --deploy
python manage.py test
```

---

## 🏗️ Architecture & Service Layer (`portfolio/services/`)

1. **`PortfolioQueryService`**:
   - Single-payload `/bootstrap/` dataset generator for fast client hydration.
   - Aggregate statistics calculator using single-pass SQL `aggregate()`.
   - Lean query projections (`.only()`) and relation prefetching (`Prefetch()`) with zero N+1 queries.
2. **`ContactMessageService`**:
   - Multi-layer spam protection (link count bounds, regex keyword filters).
   - Dual rate-limiting (sliding IP and email windows).
   - 24-hour duplicate message hash prevention.
3. **`RexiChatService`**:
   - Dynamic DB knowledge grounding (Profile, Projects, Skills, Experience, Achievements).
   - Strict 3rd-person perspective prompt generator.
   - HuggingFace Qwen inference with rule-grounded fallback matcher.
4. **`InteractionService`**:
   - Atomic database counters for project views and likes using Django `F()` expressions.
5. **`SecurityService`**:
   - Safe client IP extraction, constant-time API Key verification (`secrets.compare_digest`), text sanitization.

---

## 📡 REST API Routes

| Endpoint | Method | Description |
|---|---|---|
| `/api/v1/health/` | `GET` | System health, database connectivity, and API version |
| `/api/v1/bootstrap/` | `GET` | Single-call portfolio hydration (Profile + Projects + Skills + Experience) |
| `/api/v1/summary/` | `GET` | Aggregated portfolio metrics |
| `/api/v1/projects/` | `GET` | Active projects list (Filter: `category`, `status`, `featured`) |
| `/api/v1/projects/{slug}/` | `GET` | Single project detail by slug |
| `/api/v1/projects/featured/` | `GET` | Top 6 featured projects |
| `/api/v1/projects/{slug}/like/` | `POST` | Atomically increment project likes |
| `/api/v1/projects/{slug}/view/` | `POST` | Atomically increment project views |
| `/api/v1/experience/` | `GET` | Active experience list |
| `/api/v1/experience/{slug}/` | `GET` | Experience details by slug |
| `/api/v1/skills/` | `GET` | Skills list |
| `/api/v1/skills/{slug}/` | `GET` | Skill details by slug |
| `/api/v1/skills/top/` | `GET` | Top 10 skills by proficiency |
| `/api/v1/achievements/` | `GET` | Achievements and awards list |
| `/api/v1/categories/` | `GET` | Categories with real-time item counts |
| `/api/v1/profile/` | `GET` | Developer profile and social metadata |
| `/api/v1/contact/` | `POST` | Secure contact message submission |
| `/api/v1/rexi/chat/` | `POST` | Rexi AI assistant chat endpoint |

*Note: Canonical `/api/<endpoint>` routes are automatically maintained for 100% backward compatibility.*

---

## 🔒 Security & Performance Features

- **API Key Security**: Verified via `secrets.compare_digest` when `PORTFOLIO_API_KEY` is configured.
- **Scoped Rate Limiting**: Throttles configured for `contact`, `rexi`, and `interaction` endpoints.
- **Composite Indexing**: Optimized database indexes on all slug, category, status, and timestamp columns.
- **Read-Only Enforced**: Public data endpoints strictly enforce `ReadOnlyPermission`.
