# DevMate Portfolio — REST API Specification

The DevMate Portfolio API is a production REST API offering high-speed, aggregated payloads for frontend hydration, atomic counter increments, contact form dispatch, and intelligent Rexi AI interactions.

All endpoints are versioned under `/api/v1/` and mirrored under canonical `/api/` aliases.

---

## Base URLs

- **Version 1 (Canonical)**: `https://logicbyroshan.in/api/v1/`
- **Root Alias**: `https://logicbyroshan.in/api/`
- **Local Development**: `http://127.0.0.1:8000/api/`

---

## Authentication & Headers

| Header | Type | Required | Description |
|---|---|---|---|
| `Content-Type` | `string` | For POST payloads | `application/json` |
| `X-API-Key` | `string` | Optional / Env-dependent | API Key token if `PORTFOLIO_API_KEY` is configured in production |
| `X-Requested-With` | `string` | Optional | `XMLHttpRequest` for AJAX-specific responses |

---

## Endpoints

### 1. High-Performance Portfolio Bootstrap
Returns the complete pre-aggregated portfolio state in a single query-optimized payload to eliminate frontend request watermarking.

- **Method**: `GET`
- **Endpoint**: `/api/v1/bootstrap/` (or `/api/bootstrap/`)
- **Query Parameters**:
  - `include_inactive` (boolean, optional): Include unpublished items for preview (requires staff credentials).
- **Response**: `200 OK`
```json
{
  "profile": {
    "full_name": "Roshan Damor",
    "email": "mail@logicbyroshan.in",
    "title": "Software Engineer · Full Stack AI",
    "bio": "...",
    "hourly_rate": "45.00",
    "experience_years": 3,
    "status": "available",
    "work_type": "remote"
  },
  "categories": [
    {
      "id": 1,
      "name": "Enterprise SaaS",
      "slug": "enterprise-saas",
      "icon": "fas fa-layer-group",
      "color": "#38bdf8",
      "item_count": 4
    }
  ],
  "projects": [
    {
      "id": 1,
      "project_name": "CardFlow",
      "title": "CardFlow Enterprise ID Automation",
      "slug": "cardflow",
      "description": "High-throughput identity card platform...",
      "status": "active",
      "technologies_list": ["Python", "Django", "React", "PostgreSQL"],
      "views_count": 1420,
      "likes_count": 89
    }
  ],
  "experiences": [],
  "skills": [],
  "achievements": [],
  "summary": {
    "total_projects": 6,
    "total_experience": 2,
    "total_skills": 24,
    "total_achievements": 8
  }
}
```

---

### 2. Projects API

#### List Projects
- **Method**: `GET`
- **Endpoint**: `/api/v1/projects/`
- **Query Parameters**:
  - `category` (string, optional): Filter by category slug (e.g., `?category=enterprise-saas`).
  - `status` (string, optional): Filter by status: `active`, `completed`, `on-hold`.
  - `search` (string, optional): Full-text search across titles, descriptions, and technologies.

#### Get Project Details
- **Method**: `GET`
- **Endpoint**: `/api/v1/projects/{slug}/`

#### Increment Project Likes
- **Method**: `POST`
- **Endpoint**: `/api/v1/projects/{slug}/like/`
- **Response**: `200 OK`
```json
{
  "success": true,
  "likes_count": 90,
  "slug": "cardflow"
}
```

#### Increment Project Views
- **Method**: `POST`
- **Endpoint**: `/api/v1/projects/{slug}/view/`
- **Response**: `200 OK`
```json
{
  "success": true,
  "views_count": 1421,
  "slug": "cardflow"
}
```

---

### 3. Contact Form Submission
Submits a user message with multi-layer spam validation and IP rate limiting.

- **Method**: `POST`
- **Endpoint**: `/api/v1/contact/` (or `/api/contact/`)
- **Request Body**:
```json
{
  "name": "Sarah Jenkins",
  "email": "sarah@techcorp.com",
  "message": "Hi Roshan, we would love to discuss an engineering role with our backend team."
}
```
- **Success Response**: `201 Created`
```json
{
  "success": true,
  "message": "Thank you! Your message has been sent successfully."
}
```
- **Rate Limit Response**: `429 Too Many Requests`
```json
{
  "detail": "Contact submission limit reached. Please try again later."
}
```

---

### 4. Rexi AI Assistant Chat
Interacts with the grounded Rexi portfolio AI agent.

- **Method**: `POST`
- **Endpoint**: `/api/v1/rexi/chat/` (or `/api/rexi/chat/`)
- **Request Body**:
```json
{
  "message": "What experience do you have with Django and Celery?"
}
```
- **Success Response**: `200 OK`
```json
{
  "reply": "Roshan has extensive experience with Django and Celery, notably building the CardFlow production pipeline that asynchronously processes hundreds of high-resolution student ID cards and PDFs concurrently without HTTP timeouts.",
  "status": "success",
  "model": "qwen3-grounded"
}
```

---

### 5. Health Check
- **Method**: `GET`
- **Endpoint**: `/api/v1/health/`
- **Response**: `200 OK`
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "database": "connected"
}
```
