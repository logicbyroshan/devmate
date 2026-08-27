# DevMate Portfolio — Repository & Architecture Structure

```
DevMate/
├── .gitignore                   # Git ignore specifications for Python, Node, Vite, and OS
├── README.md                    # Main repository landing overview & quick-start
├── SETUP.md                     # Detailed local setup and verification guide
├── API.md                       # Complete REST API documentation & endpoint schemas
├── SECURITY.md                  # Security policies, disclosure process, and hardening
├── STRUCTURE.md                 # Project architecture and directory structure map
├── ABOUT.md                     # Mission statement, engineering highlights & tech stack
├── CONTRIBUTING.md              # Open source contribution workflow & PR rules
├── CODE_OF_CONDUCT.md           # Community standards & Contributor Covenant
│
├── client/                      # Modern React 18 + Vite 5 Single Page Application
│   ├── index.html               # Main entrypoint, SEO tags, JSON-LD schemas, Google Fonts
│   ├── package.json             # NPM dependencies (Vite, React, Vitest, ESLint, Lenis, KaTeX)
│   ├── vite.config.js           # Vite build config with backend proxy and path resolution
│   ├── public/                  # Static assets served directly by web server
│   │   ├── favicon.ico          # Site favicon
│   │   ├── robots.txt           # Production search crawler rules & AI bot permissions
│   │   ├── sitemap.xml          # Search engine XML sitemap
│   │   └── static/              # Optimized images, icons, sounds, and legacy script assets
│   │       ├── css/             # Modular vanilla stylesheets (variables, navbar, cards)
│   │       ├── js/              # Legacy modular scripts (contact.js, sounds.js, modal.js)
│   │       └── images/          # Compressed WebP banners, logos, and screenshots
│   └── src/                     # React application source code
│       ├── main.jsx             # React entry point, Lenis smooth scrolling orchestrator
│       ├── App.jsx              # Lightweight hash/pushState router & modal coordinator
│       ├── portfolio-body.html  # Raw template HTML markup for instant home hydration
│       ├── api/                 # Data fetchers, sessionStorage caching, and doc fixtures
│       │   ├── portfolioApi.js   # Resilient fetch client with timeout and retry logic
│       │   ├── hydratePortfolio.js # High-performance DOM hydration engine
│       │   ├── projectDocData.js # Rich technical case study content & code snippets
│       │   └── blogData.js      # Technical engineering articles and metadata
│       ├── components/          # Reusable React UI components
│       │   ├── AppNavbar.jsx    # Responsive desktop & mobile glassmorphism navigation
│       │   ├── SiteFooter.jsx   # Footer with brand links, stack tags, and copyright
│       │   ├── RexiModal.jsx    # Interactive Rexi AI assistant, PDF & Video modals
│       │   └── doc/             # Documentation components (Mermaid, KaTeX, Shiki, D2)
│       └── pages/               # Dedicated detailed view pages
│           ├── ProjectDetailPage.jsx # Technical documentation & deep architecture case studies
│           ├── AboutPage.jsx    # Comprehensive biographical and skill domains view
│           ├── BlogDetailPage.jsx # Full-width technical article reader with sticky TOC
│           └── ExperiencePage.jsx # Engineering career history and roadmap breakdown
│
└── server/                      # Django 5.2 Enterprise Backend & REST API
    ├── manage.py                # Django CLI entrypoint
    ├── requirements.txt         # Pinned Python package dependencies
    ├── .env.example             # Local development environment template
    ├── .env.production.example  # Production deployment environment template
    ├── API_README.md            # Backend REST API quick-reference guide
    ├── DEPLOYMENT_GUIDE.md      # Ubuntu Nginx/Gunicorn/PostgreSQL native VPS deployment
    ├── config/                  # Django project configuration module
    │   ├── settings.py          # Security headers, database pooling, CORS, HSTS settings
    │   ├── urls.py              # Root URL routing table (/admin/, /api/v1/, /api/)
    │   └── wsgi.py              # WSGI entrypoint for Gunicorn/production servers
    ├── portfolio/               # Core Django portfolio application
    │   ├── models.py            # Relational models (Project, Experience, Skill, Achievement, UserProfile)
    │   ├── api_views.py         # DRF ViewSets, single-pass bootstrap, like/view counters
    │   ├── views.py             # Staff management views (dashboard, projects, details)
    │   ├── serializers.py       # DRF ModelSerializers with computed attributes
    │   ├── forms.py             # Django ModelForms for staff dashboard management
    │   ├── urls.py              # Staff admin routing
    │   ├── api_urls.py          # REST API routing for /api/v1/ and /api/
    │   ├── admin.py             # Django standard admin configurations and inlines
    │   ├── tests.py             # Comprehensive test suite covering security, CRUD, and API
    │   ├── services/            # Isolated business logic and service layer
    │   │   ├── portfolio_service.py # Lean query selectors, prefetching, bootstrap aggregation
    │   │   ├── contact_service.py   # Sliding-window IP throttles & spam regex heuristics
    │   │   ├── rexi_service.py      # Qwen3 prompt grounding & fallback NLP matchers
    │   │   ├── interaction_service.py # Atomic F() expression like and view increments
    │   │   └── security_service.py  # Constant-time API key checking & IP extraction
    │   ├── migrations/          # Version-controlled database migrations
    │   └── fixtures/            # Seed data fixtures (initial_data.json)
    └── templates/               # Server-rendered HTML templates for staff management
        ├── base.html            # Core admin dashboard layout and navigation
        ├── dashboard.html       # Analytics overview with stat counters
        ├── manage_details.html  # Profile, documents, and preferences editor
        ├── manage_projects.html # Project management workspace
        ├── manage_experience.html # Experience management workspace
        ├── manage_skills.html   # Skill catalog workspace
        ├── manage_achievements.html # Credentials and awards workspace
        ├── manage_categories.html # Taxonomy and category management
        └── api_documentation.html # Interactive API documentation interface
```
