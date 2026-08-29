# 🛡️ Server Admin API Package (`admin_api`)

This directory contains the Django REST API application (`admin_api`) designed for staff-only portfolio administration.

### Interactive Swagger / Developer Portal
- Web Docs: `http://localhost:8000/api/v1/admin/docs/` or `https://devmeet.logicbyroshan.in/api/v1/admin/docs/`

### Modules & Directory Layout
```
server/admin_api/
├── apps.py                  # AdminApiConfig
├── permissions.py           # IsStaffUser, IsSuperUser
├── utils/
│   ├── security.py          # MIME checks, image & PDF validation, HTML XSS sanitization
│   └── pagination.py        # AdminStandardPagination (default 20, max 100)
├── serializers/
│   ├── auth_serializers.py
│   ├── project_serializers.py
│   ├── experience_serializers.py
│   ├── skill_serializers.py
│   ├── achievement_serializers.py
│   ├── category_serializers.py
│   ├── profile_serializers.py
│   ├── message_serializers.py
│   └── analytics_serializers.py
├── views/
│   ├── auth_views.py
│   ├── project_views.py
│   ├── experience_views.py
│   ├── skill_views.py
│   ├── achievement_views.py
│   ├── category_views.py
│   ├── profile_views.py
│   ├── message_views.py
│   └── analytics_views.py
├── docs_views.py            # Interactive HTML documentation
├── urls.py                  # API routing definitions
└── tests/                   # 23 automated tests
```

For full documentation and payload schemas, see [ADMIN_API.md](../../ADMIN_API.md).
