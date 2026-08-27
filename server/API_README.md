# Portfolio REST API & Service Layer Documentation

## 🚀 Overview & Architecture

The backend is built with **Django REST Framework (DRF)** using a strict **Service Layer Architecture**:
- **Views / ViewSets**: Lean controllers handling HTTP routing, permissions, throttling, and serialization.
- **Service Layer (`portfolio/services/`)**: Isolated business logic, multi-layer spam defense, AI chat generation, atomic counters, and query selectors.
- **Database & Model Layer**: Optimized composite indexing, `select_related`/`prefetch_related` relations, and zero N+1 queries.
- **API Versioning**: Standardized `/api/v1/` routes with canonical `/api/` fallback for full backward compatibility.

---

## 📡 API Endpoints (Version 1 & Canonical)

All endpoints support both `/api/v1/<endpoint>` and `/api/<endpoint>`:

### 1. System & Health
- `GET /api/v1/health/` — Health diagnostics, database connectivity verification, API versioning info.
- `GET /api/v1/bootstrap/` — High-speed single payload (Profile + Featured Projects + Top Skills + Recent Experience) for frontend hydration.
- `GET /api/v1/summary/` — Single-pass aggregated portfolio statistics.

### 2. Projects
- `GET /api/v1/projects/` — List all active projects (Filter params: `?category=slug&status=active&featured=true`).
- `GET /api/v1/projects/{slug}/` — Retrieve single project details with screenshots and categories.
- `GET /api/v1/projects/featured/` — Top featured projects.
- `POST /api/v1/projects/{slug}/like/` — Atomic increment project likes counter.
- `POST /api/v1/projects/{slug}/view/` — Atomic increment project views counter.

### 3. Experience
- `GET /api/v1/experience/` — List active work experience entries (Filter params: `?employment_type=full-time&category=slug`).
- `GET /api/v1/experience/{slug}/` — Retrieve single experience entry by slug.

### 4. Technical Skills
- `GET /api/v1/skills/` — List all active skills (Filter params: `?level=advanced&category=slug`).
- `GET /api/v1/skills/{slug}/` — Retrieve single skill by slug.
- `GET /api/v1/skills/top/` — Retrieve top 10 skills sorted by proficiency.

### 5. Achievements & Certifications
- `GET /api/v1/achievements/` — List active achievements and awards (Filter params: `?category=slug`).
- `GET /api/v1/achievements/{slug}/` — Retrieve single achievement by slug.

### 6. Categories & Taxonomies
- `GET /api/v1/categories/` — List all categories with annotated real-time `item_count` (Filter params: `?type=project|skill|achievement|experience`).
- `GET /api/v1/categories/{slug}/` — Retrieve category details by slug.

### 7. User Profile
- `GET /api/v1/profile/` — Retrieve developer profile and social links.

### 8. Contact & AI Assistant
- `POST /api/v1/contact/` — Secure contact form submission (Payload: `full_name`, `email`, `message`, `is_urgent`).
- `POST /api/v1/rexi/chat/` — Rexi AI Assistant query endpoint powered by Qwen3-0.6B with 3rd-person grounded responses (Payload: `message`).

---

## 🔒 Security Architecture

1. **Multi-layer Spam Defense (`ContactMessageService`)**:
   - Content length boundary enforcement.
   - Regex-based keyword spam filtering (crypto, casino, viagra, seo service, etc.).
   - Link threshold limits ($\le 2$ links allowed).
   - Sliding window IP rate limiting ($10$ msgs / $10$ min) and email rate limiting ($5$ msgs / $10$ min).
   - $24$-hour duplicate message hash prevention.

2. **Scoped Throttling**:
   - `contact`: 10 requests / minute
   - `rexi`: 30 requests / minute
   - `interaction`: 60 requests / minute
   - `anon`: 100 requests / hour
   - `user`: 1000 requests / hour

3. **Safe Read-Only Operations**:
   - Public data endpoints strictly enforce `ReadOnlyPermission` (GET, HEAD, OPTIONS).
   - Modification operations (Likes, Views, Contact, Rexi) are routed through dedicated, validated service methods.

4. **Constant-Time API Key Verification (`SecurityService`)**:
   - Uses `secrets.compare_digest` to prevent timing attacks when `PORTFOLIO_API_KEY` is configured.

---

## ⚡ Database Performance & Optimization

- **Composite Database Indexes**: Added for `(slug, is_active)`, `(category_type, slug)`, `(is_active, status, order, created_at)`, `(is_read, created_at)`.
- **Query Elimination**: Zero N+1 queries using Django ORM `select_related()` and `prefetch_related()`.
- **Atomic Concurrency**: View and like counters utilize database `F()` expressions to prevent race conditions under high concurrent traffic.
