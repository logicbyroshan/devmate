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
  Built with a <b>Pure Headless Django REST API</b> backend, a <b>React + Vite</b> client, dynamic DOM hydration, interactive full-page case studies, a built-in AI Assistant (Rexi), custom Web Audio SFX engine, and complete responsive design.
</p>

[🌐 Live Portfolio](https://logicbyroshan.in) • [🚀 Featured Projects](#-featured-projects) • [📡 API Reference](API.md) • [🛡️ Admin API Reference](ADMIN_API.md) • [🛠️ Setup Guide](SETUP.md)

</div>

---

## 🌟 Highlights & Key Engineering Features

- ⚡ **Ultra-Fast Dynamic Hydration**: React SPA client bootstraps static HTML instantly, then seamlessly hydrates dynamic content, hero visual, and live highlight stats via `/api/bootstrap/` without layout shift.
- 🪪 **100% Dynamic Engineering Case Studies**: Rich technical documentation loaded directly from the database with system topology diagrams, high-resolution screenshot lightbox galleries, and video demos.
- 🐉 **Rexi AI Assistant**: Mascot & intelligent interactive assistant powered by Qwen AI with fallback intent matching for skills, experience, and tech inquiries.
- 🔊 **Custom Web Audio Engine**: Procedural synthesizers for UI clicks, slide transitions, modal pops, and ambient background audio.
- 📱 **100% Mobile Responsive**: Comprehensive CSS media queries optimized down to 320px screens with zero horizontal overflow, touch-friendly navigation, and adaptive modals.
- 🛡️ **Production-Hardened Headless REST API**: Dedicated `admin_api` service with JWT authentication, role gating (`IsStaffUser`), file/MIME validation, XSS sanitization, and atomic database transactions to power your separate Admin Dashboard project.
- 📖 **Comprehensive Markdown Documentation**: Complete API specifications and UI render contracts in [API.md](API.md) and [ADMIN_API.md](ADMIN_API.md).

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│              Client Browser (Portfolio)                │
│            React 18 + Vite 5 + Vanilla CSS             │
└──────────────────────────┬─────────────────────────────┘
                           │
             HTTP / REST API (Public Endpoints)
             /api/bootstrap/, /api/projects/, /api/blogs/
                           ▼
┌────────────────────────────────────────────────────────┐
│             Headless Backend (Django REST)             │
│        Gunicorn + Nginx + CORS + Rate Throttling       │
└──────────────────────────┬─────────────────────────────┘
                           ▲
             HTTP / REST API (Staff JWT Protected)
             /api/v1/admin/* (CRUD & Media Uploads)
                           │
┌──────────────────────────┴─────────────────────────────┐
│          Separate Admin Dashboard Application          │
│            (Vue / React / Next.js / Angular)           │
└────────────────────────────────────────────────────────┘
```

---

## 🚀 Featured Projects

| Project | Category | Tech Stack | Status | Repository / Link |
|:---|:---|:---|:---|:---|
| **CardFlow** | Enterprise SaaS | Python, Django, React, Redis, PostgreSQL | Production Active | [GitHub](https://github.com/logicbyroshan) • [Live Demo](https://adarshidcards.in) |
| **VidyaMaxx** | EdTech Automation | Python, Django, PostgreSQL, Tailwind | Production Active | [GitHub](https://github.com/logicbyroshan) |
| **PrintNexx** | Desktop Utilities | Python, PyQt6, Redis, Electron | Beta Testing | [GitHub](https://github.com/logicbyroshan) |
| **DataMorph** | Data Pipelines | Go, Apache Kafka, DuckDB | Open Source | [GitHub](https://github.com/logicbyroshan) |

---

## 📡 REST API & Admin Integration

- **Public API Documentation**: [API.md](API.md)
- **Staff Admin API Reference**: [ADMIN_API.md](ADMIN_API.md)
- **Setup & Installation Guide**: [SETUP.md](SETUP.md)
- **Architecture & Structure Map**: [STRUCTURE.md](STRUCTURE.md)
- **Production Deployment**: [DEPLOYMENT.md](DEPLOYMENT.md)

---

## 🧪 Automated Testing

### Backend Test Suite (Django):
```bash
cd server
python manage.py test
```

### Frontend Test Suite & Build Verification (React + Vite):
```bash
cd client
npm test        # Vitest unit test suite
npm run lint    # ESLint verification (0 warnings)
npm run build   # Production bundle compilation
```

---

## 📄 License

Copyright (c) 2026 Roshan Damor. All rights reserved. Proprietary & Confidential — see [LICENSE](LICENSE).
