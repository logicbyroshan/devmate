# DevMate — Roshan Damor | Software Engineer Portfolio

<div align="center">

[![React](https://img.shields.io/badge/React-18.3+-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-5.4+-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![JavaScript](https://img.shields.io/badge/ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![CSS3](https://img.shields.io/badge/CSS3-Vanilla%20Design%20System-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://www.w3.org/Style/CSS/)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-success?style=for-the-badge)](#)

<p align="center">
  <b>A production-grade, highly performant personal portfolio and engineering showcase.</b><br>
  Built as a <b>100% Standalone React 18 + Vite 5 Single Page Application</b> that dynamically consumes public REST APIs from <b>DevAdmin</b> (or renders resilient futuristic dark-mode empty states). Features dynamic DOM hydration, interactive full-page case studies, a built-in AI Assistant (Rexi), custom Web Audio SFX engine, and complete responsive design.
</p>

[🌐 Live Portfolio](https://logicbyroshan.in) • [🚀 Featured Projects](#-featured-projects) • [📡 DevAdmin API Contract](API.md) • [🛠️ Setup Guide](SETUP.md)

</div>

---

## 🌟 Highlights & Key Engineering Features

- ⚡ **Ultra-Fast Dynamic Hydration**: Instant static HTML bootstrapping with seamless dynamic hydration for profile, skills, case studies, and live telemetry from the `DevAdmin` API with zero layout shift (CLS = 0.000).
- 🪪 **100% Dynamic Technical Case Studies**: In-depth technical documentation loaded directly from API endpoints with system topology diagrams, high-resolution screenshot lightbox galleries, and video demos.
- 🐉 **Rexi AI Assistant**: Mascot & intelligent interactive assistant powered by Qwen AI with fallback intent matching for skills, experience, and tech inquiries.
- 🌌 **Futuristic Glassmorphic Empty States**: If the backend API is disconnected, in draft mode, or returns empty arrays, every section and page renders a glowing, dark-mode glassmorphic empty state card.
- 🔊 **Custom Web Audio Engine**: Procedural synthesizers for UI clicks, slide transitions, modal pops, and ambient background audio.
- 📱 **100% Mobile Responsive**: Comprehensive CSS media queries optimized down to 320px screens with zero horizontal overflow, touch-friendly navigation, and adaptive modals.
- 🏎️ **Peak Performance**: 100/100 Lighthouse ratings across Accessibility, Best Practices, and SEO.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   DevMate (This Repo)                  │
│        Standalone React 18 + Vite 5 Client SPA         │
└──────────────────────────┬─────────────────────────────┘
                           │
             HTTP / REST API (Public Endpoints)
             /api/bootstrap/, /api/projects/, /api/blogs/
                           ▼
┌────────────────────────────────────────────────────────┐
│             DevAdmin Project (Central API)             │
│        Headless Django REST + PostgreSQL + Redis       │
└──────────────────────────┬─────────────────────────────┘
                           ▲
             HTTP / REST API (Staff JWT Protected)
             /api/v1/admin/* (CRUD & Media Uploads)
                           │
┌──────────────────────────┴─────────────────────────────┐
│          DevAdmin Control Panel Application            │
│              (Staff Content Management)                │
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

## 🛠️ Quick Start & Local Development

```bash
# 1. Install dependencies
npm install

# 2. Configure environment (optional, defaults to /api)
cp .env.example .env

# 3. Start local development server
npm run dev
```

---

## 🧪 Automated Testing & Verification

```bash
npm test        # Vitest unit test suite (16 tests)
npm run lint    # ESLint verification (0 warnings)
npm run build   # Production bundle compilation
```

---

## 📄 License

Copyright (c) 2026 Roshan Damor. All rights reserved. Proprietary & Confidential — see [LICENSE](LICENSE).

