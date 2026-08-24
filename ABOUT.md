# About DevMate Portfolio

## Mission & Purpose

**DevMate Portfolio** is an enterprise-grade developer portfolio and technical showcase engineered to highlight scalable full-stack software development, distributed systems architecture, production AI applications, and algorithmic engineering.

Built by **Roshan Damor**, a Software Engineer focused on high-throughput backend services and AI-driven platforms, this project demonstrates production-level engineering practices:
- **Clean Architectural Separation**: Domain services decoupled from HTTP views and database controllers.
- **Defensive Reliability**: Atomic database counter expressions, input sanitization, sliding-window rate limiters, and anti-spam heuristics.
- **High-Performance Hydration**: Single-pass aggregated bootstrap payload (`/api/v1/bootstrap/`) eliminating N+1 API cascades on initial page load.
- **Rich Interactive Technical Documentation**: In-depth architectural case studies featuring Mermaid flowcharts, Shiki syntax-highlighted code blocks, KaTeX mathematical formulas, and interactive topology models.

---

## Technical Stack & Rationale

### Backend
- **Python 3.11+ / Django 5.2**: Mature, secure web framework providing ORM parameterized queries, session authentication, and database migrations.
- **Django REST Framework (DRF)**: Serializers with query-lean computed fields and atomic viewsets.
- **PostgreSQL**: Production relational storage with composite indexes (`(is_active, order)`), foreign keys, and connection pooling.
- **Redis & Celery**: Background task dispatch and asynchronous pipelines for document generation.

### Frontend
- **React 18 & Vite 5**: Ultra-fast hot module replacement, minimal asset bundles, and reactive page transitions.
- **Vanilla CSS Design System**: Custom glassmorphism, responsive CSS grid, CSS custom properties, and micro-animations without bloated runtime frameworks.
- **Lenis Smooth Scroll**: Inertial smooth scrolling for high-end digital aesthetics.
- **Mermaid & KaTeX**: Rendering dynamic system diagrams and algorithmic complexity models in technical case studies.

---

## Contact & Author

- **Author**: Roshan Damor
- **Role**: Software Engineer · Full Stack AI
- **Website**: [logicbyroshan.in](https://logicbyroshan.in)
- **Email**: [mail@logicbyroshan.in](mailto:mail@logicbyroshan.in)
- **GitHub**: [@logicbyroshan](https://github.com/logicbyroshan)
- **LinkedIn**: [in/logicbyroshan](https://linkedin.com/in/logicbyroshan)
