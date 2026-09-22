# DevMate Portfolio — Repository & Architecture Structure

```
DevMate/
├── .gitignore                   # Git ignore specifications for Python, Node, Vite, and OS
├── LICENSE                      # Proprietary software license notice
├── README.md                    # Main repository landing overview & quick-start
├── SETUP.md                     # Detailed local setup and verification guide
├── API.md                       # Comprehensive REST API specification & Admin Dashboard Guide
├── ADMIN_API.md                 # Staff Admin REST API reference & authentication
├── SECURITY.md                  # Security policies, disclosure process, and hardening
├── STRUCTURE.md                 # Project architecture and directory structure map
├── ABOUT.md                     # Mission statement, engineering highlights & tech stack
├── DEPLOYMENT.md                # Production deployment guide (VPS, Nginx, Gunicorn, Systemd)
│
├── client/                      # Modern React 18 + Vite 5 Single Page Application (100% Decoupled API Consumer)
│   ├── index.html               # Main entrypoint, SEO tags, JSON-LD schemas, Google Fonts
│   ├── package.json             # NPM dependencies (Vite, React, Vitest, ESLint, Lenis, KaTeX)
│   ├── vite.config.js           # Vite build config with backend proxy and path resolution
│   ├── public/                  # Static assets served directly by web server
│   │   ├── favicon.ico          # Site favicon
│   │   ├── robots.txt           # Production search crawler rules & AI bot permissions
│   │   ├── sitemap.xml          # Search engine XML sitemap
│   │   └── static/              # Optimized images, icons, sounds, and assets
│   │       ├── css/             # Modular vanilla stylesheets (variables, navbar, cards)
│   │       ├── js/              # Modular scripts (contact.js, sounds.js, modal.js)
│   │       └── images/          # Compressed WebP banners, logos, and screenshots
│   └── src/                     # React application source code
│       ├── main.jsx             # React entry point, Lenis smooth scrolling orchestrator
│       ├── App.jsx              # Lightweight hash/pushState router & modal coordinator
│       ├── portfolio-body.html  # Raw template HTML markup for instant home hydration
│       ├── api/                 # Data fetchers, sessionStorage caching, and dynamic hydration
│       │   ├── portfolioApi.js   # Resilient fetch client with timeout and retry logic
│       │   ├── hydratePortfolio.js # High-performance DOM hydration engine (Hero, Stats, Cards)
│       │   ├── hydratePortfolio.test.js # Vitest unit tests for DOM hydration
│       │   └── blogData.js      # Technical engineering articles and fallback dataset
│       ├── components/          # Reusable React UI components
│       │   ├── AppNavbar.jsx    # Responsive desktop & mobile glassmorphism navigation
│       │   ├── SiteFooter.jsx   # Footer with brand links, stack tags, and copyright
│       │   ├── RexiModal.jsx    # Interactive Rexi AI assistant, PDF & Video modals
│       │   └── doc/             # Documentation components (Mermaid, KaTeX, Shiki, D2)
│       └── pages/               # Dedicated detailed view pages
│           ├── ProjectDetailPage.jsx # Technical documentation & deep architecture case studies (100% Dynamic)
│           ├── AboutPage.jsx    # Comprehensive biographical and categorized skills view
│           ├── BlogDetailPage.jsx # Full-width technical article reader with dynamic API loading & TOC
│           └── ExperiencePage.jsx # Engineering career history and workplace photo galleries
│
└── server/                      # Django 5.2 Enterprise Headless Backend & REST API
    ├── manage.py                # Django CLI entrypoint
    ├── requirements.txt         # Pinned Python package dependencies
    ├── .env.example             # Local development environment template
    ├── .env.production.example  # Production deployment environment template
    ├── config/                  # Django project configuration module
    │   ├── settings.py          # Security headers, database pooling, CORS, HSTS settings
    │   ├── urls.py              # Root URL routing table (/admin/, /api/v1/admin/, /api/v1/, /api/)
    │   └── wsgi.py              # WSGI entrypoint for Gunicorn/production servers
    ├── admin_api/               # Dedicated Staff Admin REST API (JWT Protected)
    │   ├── serializers/         # CRUD Serializers (projects, exp, skills, profile, hero)
    │   ├── views/               # ViewSets, screenshot actions, hero upload, analytics
    │   ├── utils/               # MIME/file validator, HTML sanitization
    │   └── tests/               # Automated test suite for admin endpoints
    ├── media/                   # User-uploaded assets (hero images, project screenshots, PDFs)
    └── portfolio/               # Portfolio core application & public API
        ├── models.py            # Relational models (Project, Experience, Skill, Achievement, UserProfile)
        ├── serializers.py       # DRF ModelSerializers with computed attributes
        ├── api_views.py         # Public read-only REST viewsets, bootstrap, blogs, and telemetry
        ├── api_urls.py          # Public REST API routing for /api/v1/ and /api/
        ├── admin.py             # Django standard admin configurations
        ├── views.py             # Utility functions (unique slug generators, parsers)
        ├── urls.py              # Clean URL module
        ├── tests.py             # Public API & Model unit test suite
        ├── services/            # Isolated business logic and service layer
        │   ├── portfolio_service.py # Lean query selectors, prefetching, bootstrap aggregation
        │   ├── contact_service.py   # Sliding-window IP throttles & spam regex heuristics
        │   ├── rexi_service.py      # Qwen3 prompt grounding & fallback NLP matchers
        │   ├── interaction_service.py # Atomic F() expression like and view increments
        │   └── security_service.py  # Constant-time API key checking & IP extraction
        ├── migrations/          # Version-controlled database migrations
        └── fixtures/            # Seed data fixtures (initial_data.json)
```
