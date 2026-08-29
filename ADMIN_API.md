# 🛡️ DevMate Staff Admin REST API Reference

The **DevMate Admin REST API** (`admin_api`) is a secure, role-gated, versioned backend service providing full dynamic CRUD capabilities for managing portfolio data, uploading multimedia assets, ordering items, inspecting messages, and viewing real-time analytics.

---

## 🔒 Security & Architecture Overview

- **Base URL**: `/api/v1/admin/` (canonical alias: `/api/admin/`)
- **Interactive Documentation**: [`https://devmeet.logicbyroshan.in/api/v1/admin/docs/`](http://localhost:8000/api/v1/admin/docs/)
- **Authentication**: JWT Bearer Tokens (`Authorization: Bearer <token>`) or Django Session Authentication.
- **Access Control**: Strict `is_staff = True` requirement. Non-staff and unauthenticated requests receive HTTP `401 Unauthorized` or `403 Forbidden`.
- **Upload Protection**: File extension whitelisting, MIME type verification, path traversal sanitation, and upload size validation.
- **XSS Sanitization**: Automated HTML stripping for dangerous `<script>`, `<iframe>`, and JavaScript event attributes.
- **Database Safety**: Multi-model writes wrapped in atomic transactions (`transaction.atomic`).

---

## 🔑 Authentication Endpoints

### 1. Staff Login (Generate JWT)
- **Method**: `POST`
- **Path**: `/api/v1/admin/auth/login/`
- **Request Body**:
```json
{
  "username": "admin_username",
  "password": "your_secure_password"
}
```
- **Response (HTTP 200)**:
```json
{
  "success": true,
  "message": "Welcome back, Roshan Damor!",
  "access": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin_username",
    "email": "mail@logicbyroshan.in",
    "is_staff": true,
    "is_superuser": true
  }
}
```

### 2. Refresh Access Token
- **Method**: `POST`
- **Path**: `/api/v1/admin/auth/refresh/`
- **Request Body**:
```json
{
  "refresh": "<YOUR_REFRESH_TOKEN>"
}
```

### 3. Current Staff User Profile
- **Method**: `GET`
- **Path**: `/api/v1/admin/auth/me/`
- **Headers**: `Authorization: Bearer <ACCESS_TOKEN>`

---

## 📂 CRUD API Reference

All requests below require `Authorization: Bearer <ACCESS_TOKEN>`.

### 1. 🚀 Projects (`/api/v1/admin/projects/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/projects/` | List all projects (supports query params: `?status=`, `?is_active=`, `?is_featured=`, `?category=`, `?search=`) |
| `POST` | `/api/v1/admin/projects/` | Create new project with optional `thumbnail` and `screenshots` (Multipart form or JSON) |
| `GET` | `/api/v1/admin/projects/{id}/` | Retrieve single project by ID with screenshots list |
| `PUT` / `PATCH` | `/api/v1/admin/projects/{id}/` | Full or partial project update |
| `DELETE` | `/api/v1/admin/projects/{id}/` | Delete project and associated assets |
| `POST` | `/api/v1/admin/projects/{id}/upload-screenshots/` | Upload one or multiple screenshot images |
| `DELETE` | `/api/v1/admin/projects/{id}/screenshots/{screenshot_id}/` | Remove a specific project screenshot |
| `POST` | `/api/v1/admin/projects/{id}/toggle-active/` | Fast toggle active / inactive visibility |
| `POST` | `/api/v1/admin/projects/reorder/` | Reorder projects via `{"order_map": {"1": 0, "2": 1}}` |
| `POST` | `/api/v1/admin/projects/bulk-status/` | Bulk update project status or visibility |

#### Example: Create Project (cURL)
```bash
curl -X POST http://localhost:8000/api/v1/admin/projects/ \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -F "title=Cloud Mesh Engine" \
  -F "category_id=1" \
  -F "technologies=Go, Kubernetes, React" \
  -F "status=active" \
  -F "is_active=true" \
  -F "is_featured=true" \
  -F "thumbnail=@/path/to/thumbnail.jpg" \
  -F "screenshots=@/path/to/shot1.jpg" \
  -F "screenshots=@/path/to/shot2.jpg"
```

---

### 2. 💼 Work Experience (`/api/v1/admin/experience/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/experience/` | List all experiences (supports `?is_active=`, `?is_draft=`) |
| `POST` | `/api/v1/admin/experience/` | Create work experience with optional `company_logo` and `workplace_images` |
| `GET` | `/api/v1/admin/experience/{id}/` | Retrieve single experience |
| `PUT` / `PATCH` | `/api/v1/admin/experience/{id}/` | Update experience details |
| `DELETE` | `/api/v1/admin/experience/{id}/` | Delete experience |
| `POST` | `/api/v1/admin/experience/{id}/toggle-active/` | Toggle active status |
| `DELETE` | `/api/v1/admin/experience/{id}/images/{image_id}/` | Delete an attached workplace photo |

---

### 3. ⚡ Skills & Certifications (`/api/v1/admin/skills/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/skills/` | List all technical skills |
| `POST` | `/api/v1/admin/skills/` | Create skill with proficiency (0-100), FontAwesome class or uploaded icon |
| `GET` | `/api/v1/admin/skills/{id}/` | Retrieve single skill |
| `PUT` / `PATCH` | `/api/v1/admin/skills/{id}/` | Update skill |
| `DELETE` | `/api/v1/admin/skills/{id}/` | Delete skill |
| `POST` | `/api/v1/admin/skills/{id}/toggle-active/` | Toggle skill active status |

---

### 4. 🏆 Achievements & Credentials (`/api/v1/admin/achievements/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/achievements/` | List achievements and certificates |
| `POST` | `/api/v1/admin/achievements/` | Create achievement with credential file or verification link |
| `GET` | `/api/v1/admin/achievements/{id}/` | Retrieve single achievement |
| `PUT` / `PATCH` | `/api/v1/admin/achievements/{id}/` | Update achievement |
| `DELETE` | `/api/v1/admin/achievements/{id}/` | Delete achievement |
| `POST` | `/api/v1/admin/achievements/{id}/toggle-active/` | Toggle active status |

---

### 5. 🏷️ Categories (`/api/v1/admin/categories/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/categories/` | List categories (supports `?type=project|experience|skill|achievement`) |
| `POST` | `/api/v1/admin/categories/` | Create new category (auto-generates unique slug) |
| `GET` | `/api/v1/admin/categories/{id}/` | Retrieve single category |
| `PUT` / `PATCH` | `/api/v1/admin/categories/{id}/` | Update category |
| `DELETE` | `/api/v1/admin/categories/{id}/` | Delete category |

---

### 6. 👤 User Profile & SEO (`/api/v1/admin/profile/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/profile/` | Retrieve user profile, social links, and SEO metadata |
| `PUT` / `PATCH` | `/api/v1/admin/profile/` | Update profile fields |
| `POST` | `/api/v1/admin/profile/upload-image/` | Upload profile avatar (`profile_image`) |
| `DELETE` | `/api/v1/admin/profile/delete-image/` | Remove profile avatar |
| `POST` | `/api/v1/admin/profile/upload-document/` | Upload resume / cover letter PDF (`doc_type=resume|cover_letter`) |
| `DELETE` | `/api/v1/admin/profile/delete-document/?type=resume` | Remove resume / cover letter PDF |

---

### 7. 📬 Contact Messages Inbox (`/api/v1/admin/messages/`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/v1/admin/messages/` | List contact form submissions (supports `?is_read=`, `?is_urgent=`, `?search=`) |
| `GET` | `/api/v1/admin/messages/{id}/` | Retrieve message (automatically marks as read) |
| `DELETE` | `/api/v1/admin/messages/{id}/` | Delete message |
| `POST` | `/api/v1/admin/messages/{id}/toggle-read/` | Toggle read / unread state |
| `POST` | `/api/v1/admin/messages/bulk-action/` | Bulk action (`mark_read`, `mark_unread`, or `delete`) |

---

### 8. 📊 Live Dashboard & Analytics (`/api/v1/admin/analytics/dashboard/`)

- **Method**: `GET`
- **Path**: `/api/v1/admin/analytics/dashboard/`
- **Response**:
```json
{
  "success": true,
  "data": {
    "projects": {
      "total": 12,
      "active": 10,
      "drafts": 2,
      "featured": 4,
      "total_views": 4520,
      "total_likes": 312
    },
    "experience": { "total": 6, "active": 5 },
    "skills": { "total": 24, "active": 24 },
    "achievements": { "total": 8, "active": 8 },
    "categories": { "total": 10 },
    "messages": { "total": 15, "unread": 2, "urgent": 1 },
    "recent_activity": {
      "recent_projects": [...],
      "recent_messages": [...]
    }
  }
}
```
