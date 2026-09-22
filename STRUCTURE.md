# DevMate Portfolio — Repository & Architecture Structure

```
DevMate/
├── .gitignore                   # Git ignore specifications for Node, Vite, dist, and OS
├── LICENSE                      # Proprietary software license notice (Roshan Damor)
├── README.md                    # Main repository landing overview & quick-start
├── SETUP.md                     # Local setup and development guide
├── API.md                       # DevAdmin Public REST API specification & integration contract
├── SECURITY.md                  # Security policies, disclosure process, and hardening
├── STRUCTURE.md                 # Project architecture and directory structure map
├── ABOUT.md                     # Mission statement, engineering highlights & tech stack
├── DEPLOYMENT.md                # Production static hosting and deployment guide (Vercel, Netlify, Nginx)
│
├── package.json                 # NPM dependencies (Vite, React, Vitest, ESLint, Lenis, KaTeX, Mermaid)
├── package-lock.json            # Deterministic lockfile
├── vite.config.js               # Vite build config with path aliases and proxy support
├── index.html                   # Main entrypoint, SEO meta, JSON-LD schemas, Google Fonts
├── .env.example                 # Local development environment template
├── .env.production.example      # Production environment template (points to DevAdmin API)
│
├── public/                      # Static assets served directly
│   ├── favicon.ico              # Site favicon
│   ├── robots.txt               # Production search crawler rules & AI bot permissions
│   ├── sitemap.xml              # Search engine XML sitemap
│   ├── site.webmanifest         # PWA web manifest
│   └── static/                  # Optimized media and stylesheet assets
│       ├── css/                 # Modular vanilla stylesheets (variables, navbar, empty-states)
│       ├── js/                  # Modular interaction scripts (contact.js, sounds.js, modal.js)
│       └── images/              # Compressed WebP banners, logos, and screenshots
│
└── src/                         # React application source code
    ├── main.jsx                 # React entry point, Lenis smooth scrolling orchestrator
    ├── App.jsx                  # Lightweight pushState router & modal coordinator
    ├── portfolio-body.html      # Raw template HTML markup for instant home hydration
    ├── api/                     # Resilient data fetchers, caching, and hydration engine
    │   ├── portfolioApi.js       # Standalone fetch client with timeout, retry, and offline fallbacks
    │   ├── hydratePortfolio.js   # Dynamic DOM hydration engine with glowing empty states
    │   ├── hydratePortfolio.test.js # Vitest unit tests for DOM hydration & empty states
    │   └── blogData.js          # Technical engineering articles and fallback dataset
    ├── components/              # Reusable React UI components
    │   ├── AppNavbar.jsx        # Responsive desktop & mobile glassmorphism navigation
    │   ├── SiteFooter.jsx       # Footer with brand links, stack tags, and copyright
    │   ├── RexiModal.jsx        # Interactive Rexi AI assistant, PDF & Video modals
    │   └── doc/                 # Documentation components (Mermaid, KaTeX, Shiki, D2)
    └── pages/                   # Dedicated detailed view pages
        ├── ProjectDetailPage.jsx # Technical documentation & deep architecture case studies
        ├── AboutPage.jsx        # Comprehensive biographical and categorized skills view
        ├── BlogDetailPage.jsx   # Full-width technical article reader with dynamic API loading & TOC
        └── ExperiencePage.jsx   # Engineering career history and workplace photo galleries
```

