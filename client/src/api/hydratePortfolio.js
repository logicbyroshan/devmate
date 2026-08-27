function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export function safeUrl(url, fallback = '#') {
  if (!url) return fallback;

  try {
    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost';
    const parsed = new URL(String(url), baseOrigin);
    const allowedProtocols = new Set(['http:', 'https:', 'mailto:', 'tel:']);
    return allowedProtocols.has(parsed.protocol) ? parsed.href : fallback;
  } catch {
    return fallback;
  }
}

function setMetaByName(name, content) {
  if (!content) return;

  let tag = document.head.querySelector(`meta[name="${name}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('name', name);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setMetaByProperty(property, content) {
  if (!content) return;

  let tag = document.head.querySelector(`meta[property="${property}"]`);
  if (!tag) {
    tag = document.createElement('meta');
    tag.setAttribute('property', property);
    document.head.appendChild(tag);
  }
  tag.setAttribute('content', content);
}

function setLinkHref(rel, href) {
  if (!href) return;

  let link = document.head.querySelector(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  link.setAttribute('href', href);
}

function setJsonLdById(id, payload) {
  const script = document.getElementById(id);
  if (!script || !payload) return;

  script.textContent = JSON.stringify(payload);
}

function toAbsoluteUrl(url, fallback) {
  const candidate = safeUrl(url, fallback);
  try {
    return new URL(candidate, window.location.origin).href;
  } catch {
    return fallback;
  }
}

function updateSeoMetadata(profile, projects) {
  const fullName = profile?.full_name || 'Roshan Damor';
  const alternateName = 'Roshand Damor';
  const canonicalUrl = 'https://logicbyroshan.in/';
  const title = profile?.meta_title || `${fullName} | Software Engineer Portfolio`;
  const description = profile?.meta_description || `${fullName} is a software engineer focused on building production-grade web systems, SaaS platforms, and practical AI-powered applications.`;
  const keywords = profile?.meta_keywords || 'Roshan Damor, Software Engineer, Portfolio, Full Stack, AI Engineer, React, Django, Python';
  const ogImage = toAbsoluteUrl(
    projects?.[0]?.thumbnail || '/static/images/hero.png',
    'https://logicbyroshan.in/static/images/hero.png',
  );

  document.title = title;
  setMetaByName('description', description);
  setMetaByName('keywords', keywords);
  setMetaByName('author', fullName);
  setMetaByName('twitter:title', title);
  setMetaByName('twitter:description', description);
  setMetaByName('twitter:image', ogImage);

  setMetaByProperty('og:title', title);
  setMetaByProperty('og:description', description);
  setMetaByProperty('og:url', canonicalUrl);
  setMetaByProperty('og:image', ogImage);
  setMetaByProperty('og:image:alt', `${fullName} portfolio`);

  setLinkHref('canonical', canonicalUrl);

  const sameAs = [profile?.github, profile?.linkedin, profile?.twitter, profile?.youtube, profile?.website]
    .map((url) => safeUrl(url, ''))
    .filter((url) => Boolean(url));

  setJsonLdById('seo-schema-person', {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Person',
        '@id': `${canonicalUrl}#person`,
        name: fullName,
        alternateName: [alternateName],
        url: canonicalUrl,
        image: ogImage,
        jobTitle: profile?.title || 'Software Engineer',
        description,
        ...(sameAs.length ? { sameAs } : {}),
      },
      {
        '@type': 'WebSite',
        '@id': `${canonicalUrl}#website`,
        url: canonicalUrl,
        name: `${fullName} Portfolio`,
        description,
        publisher: { '@id': `${canonicalUrl}#person` },
      },
    ],
  });
}

function formatDateRange(startDate, endDate, currentlyWorking) {
  if (!startDate) return 'Timeline not specified';

  const start = new Date(startDate);
  const startLabel = Number.isNaN(start.getTime())
    ? String(startDate)
    : start.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  if (currentlyWorking) {
    return `${startLabel} - Present`;
  }

  if (!endDate) {
    return startLabel;
  }

  const end = new Date(endDate);
  const endLabel = Number.isNaN(end.getTime())
    ? String(endDate)
    : end.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return `${startLabel} - ${endLabel}`;
}

function setText(selector, text) {
  const element = document.querySelector(selector);
  if (element && text) {
    element.textContent = text;
  }
}

function updateProfile(profile) {
  if (!profile) return;

  const heroHeading = document.querySelector('.hero-heading');
  if (heroHeading) {
    const fullName = profile.full_name || 'Roshan Damor';
    let title = profile.title || 'Software Engineer';
    let titleHtml = escapeHtml(title).replaceAll('\n', '<br>');
    heroHeading.innerHTML = `${escapeHtml(fullName)}<br><span class="text-gradient">${titleHtml}</span>`;
  }

  setText('.about-description', profile.bio || 'Software Engineer focused on building production-grade web systems, SaaS platforms, and practical AI-powered applications.');

  const contactValues = document.querySelectorAll('.contact-value');
  if (contactValues.length >= 3) {
    contactValues[0].textContent = profile.email || contactValues[0].textContent;
    contactValues[1].textContent = profile.phone || contactValues[1].textContent;
    contactValues[2].textContent = profile.location || contactValues[2].textContent;
  }

  const footerContactValues = document.querySelectorAll('.footer-contact-list li span');
  if (footerContactValues.length >= 3) {
    footerContactValues[0].textContent = profile.email || footerContactValues[0].textContent;
    footerContactValues[1].textContent = profile.phone || footerContactValues[1].textContent;
    footerContactValues[2].textContent = profile.location || footerContactValues[2].textContent;
  }

  const socials = {
    github: profile.github,
    linkedin: profile.linkedin,
    twitter: profile.twitter,
  };

  document.querySelectorAll('.footer-social-btn').forEach((link) => {
    const label = (link.getAttribute('aria-label') || '').toLowerCase();
    if (label.includes('github') && socials.github) {
      link.href = socials.github;
    }
    if (label.includes('linkedin') && socials.linkedin) {
      link.href = socials.linkedin;
    }
    if ((label.includes('twitter') || label.includes('x')) && socials.twitter) {
      link.href = socials.twitter;
    }
  });
}

export const PROJECT_DOCUMENTATION = {
  CardFlow: `
    <div class="case-study-container">
      <!-- 1. Hero & Scale Metrics -->
      <div class="case-study-hero-banner">
        <div class="case-study-badge"><i class="fas fa-shield-alt"></i> Enterprise Production SaaS</div>
        <h3 class="case-study-headline">CardFlow — Enterprise ID Card Management & Automated Generation Platform</h3>
        <p class="case-study-lead">CardFlow is a centralized production software platform built to help schools and organizations manage large volumes of ID-card data, streamline verification and approval workflows, process student information, and generate downloadable high-DPI ID-card outputs through a centralized system. Designed and developed from the ground up by me end-to-end.</p>
      </div>

      <!-- Links Row -->
      <div class="cs-links-row">
        <span style="font-size: 12px; font-weight: 600; color: #a78bfa;"><i class="fas fa-link"></i> Live Links:</span>
        <a href="https://cardflow.in" target="_blank" rel="noopener noreferrer" class="cs-link-pill primary"><i class="fas fa-globe"></i> Live Website (cardflow.in)</a>
        <a href="https://play.google.com/store" target="_blank" rel="noopener noreferrer" class="cs-link-pill secondary"><i class="fab fa-google-play"></i> Play Store App</a>
        <a href="https://github.com/logicbyroshan/cardfloww-idcard-management-saas.git" target="_blank" rel="noopener noreferrer" class="cs-link-pill secondary"><i class="fab fa-github"></i> GitHub Repository</a>
      </div>

      <!-- Real Scale Metrics -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-chart-line"></i> Production Scale & Impact</h4>
        <div class="case-study-stats-grid">
          <div class="cs-stat-card">
            <div class="cs-stat-number">1,000+</div>
            <div class="cs-stat-label">Production Users</div>
            <div class="cs-stat-sub">Actively used by real organizations</div>
          </div>
          <div class="cs-stat-card">
            <div class="cs-stat-number">136K+</div>
            <div class="cs-stat-label">ID Cards Managed</div>
            <div class="cs-stat-sub">Processed student & staff records</div>
          </div>
          <div class="cs-stat-card">
            <div class="cs-stat-number">86K+</div>
            <div class="cs-stat-label">Cards Downloaded</div>
            <div class="cs-stat-sub">High-DPI print-ready outputs</div>
          </div>
          <div class="cs-stat-card">
            <div class="cs-stat-number">435+</div>
            <div class="cs-stat-label">Play Store Installs</div>
            <div class="cs-stat-sub">Android mobile app users</div>
          </div>
        </div>
      </div>

      <!-- 2. Core Data Workflow (State Machine) -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-random"></i> Core Data Workflow Lifecycle</h4>
        <p class="cs-sub-lead">The system is built around an explicit workflow-based state model rather than treating ID cards as isolated files:</p>
        <div class="cs-workflow-flow">
          <div class="cs-wf-step">1. Pending</div>
          <div class="cs-wf-arrow"><i class="fas fa-chevron-right"></i></div>
          <div class="cs-wf-step">2. Verified</div>
          <div class="cs-wf-arrow"><i class="fas fa-chevron-right"></i></div>
          <div class="cs-wf-step">3. Approved</div>
          <div class="cs-wf-arrow"><i class="fas fa-chevron-right"></i></div>
          <div class="cs-wf-step">4. Processed</div>
          <div class="cs-wf-arrow"><i class="fas fa-chevron-right"></i></div>
          <div class="cs-wf-step wf-active">5. Downloaded</div>
        </div>
      </div>

      <!-- 3. Problem Solved vs. CardFlow Solution -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-crosshairs"></i> Problem Solved vs. CardFlow Solution</h4>
        <div class="cs-two-col">
          <div class="cs-col-box cs-problem-box">
            <div class="cs-col-header"><i class="fas fa-exclamation-triangle"></i> Traditional Bottlenecks</div>
            <ul class="cs-list cs-list-problem">
              <li>Manual spreadsheets and disconnected image folders</li>
              <li>Duplicate records and disorganized student photographs</li>
              <li>Repetitive manual data verification and status tracking</li>
              <li>Multiple stakeholders editing conflicting datasets</li>
              <li>Slow, error-prone manual approval and export processes</li>
            </ul>
          </div>
          <div class="cs-col-box cs-solution-box">
            <div class="cs-col-header"><i class="fas fa-check-circle"></i> Centralized CardFlow Solution</div>
            <ul class="cs-list cs-list-solution">
              <li>Centralized data pipelines with instant duplicate detection</li>
              <li>Automated photo cropping, finishing, and matching</li>
              <li>Granular RBAC for Admins, Schools, and Operators</li>
              <li>Asynchronous background rendering via Celery & Redis</li>
              <li>One-click batch generation of print-ready thermal card files</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 4. 9 Core Engineering Components -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-cubes"></i> 9 Core Engineering Components</h4>
        <div class="cs-grid-3">
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-table"></i> 1. Data Management Engine</div>
            <p>Flexible table-oriented schema supporting configurable fields, multi-type values, unique constraints, duplicate detection, and high-performance bulk operations.</p>
          </div>
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-user-shield"></i> 2. Authentication & RBAC</div>
            <p>Role-based architecture (Owner, Admin, Assistant, Operator) strictly governing permissions for view, create, edit, verify, approve, download, and user administration.</p>
          </div>
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-tasks"></i> 3. Workflow Management</div>
            <p>Explicit lifecycle transitions making it possible to track progress across large datasets with complete administrative visibility.</p>
          </div>
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-history"></i> 4. Audit Logging Layer</div>
            <p>Records who performed an action, what operation occurred, affected record, timestamp, and field-level diffs for full organizational compliance.</p>
          </div>
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-file-import"></i> 5. Import & Export Engine</div>
            <p>Imports CSV, XLSX, and ZIP photo datasets with automatic schema validation; exports XLSX, CSV, print-ready PDF, and DOCX outputs.</p>
          </div>
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-images"></i> 6. Image & Photo Pipeline</div>
            <p>Dedicated processing for student & relationship photographs, missing photo indicators, and auto-cropping to prevent misprinted physical cards.</p>
          </div>
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-bolt"></i> 7. Background Processing</div>
            <p>Celery + Redis workers offload heavy image manipulation, PDF compilation, and large imports from the synchronous HTTP request thread.</p>
          </div>
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-network-wired"></i> 8. REST API Architecture</div>
            <p>Django REST Framework API-first backend providing centralized endpoints for auth, cards, workflows, and batch operations across all clients.</p>
          </div>
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-mobile-alt"></i> 9. Cross-Platform Ecosystem</div>
            <p>Shared backend logic serving React Web, Electron Desktop, and React Native Android clients with identical business rules.</p>
          </div>
        </div>
      </div>

      <!-- 5. Background Processing Pipeline Flowchart -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-microchip"></i> Background Processing Architecture (Celery + Redis)</h4>
        <div class="cs-ascii-box">User Request ──► Django REST API ──► Create Background Job ──► Redis Queue
                                                                   │
                                                                   ▼
User Receives Result ◄── Update Database ◄── Process Task ◄── Celery Worker</div>
      </div>

      <!-- 6. Production Infrastructure Flowchart -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-server"></i> Production Deployment & Infrastructure</h4>
        <div class="cs-ascii-box">[Web Clients / Apps] ──► Internet ──► Nginx Reverse Proxy ──► Gunicorn ──► Django / DRF ──► PostgreSQL DB
                                                                      │
                                                                      ▼
                                                                Redis Queue ──► Celery Workers ──► High-DPI Output Generation</div>
      </div>

      <!-- 7. Technology Stack Breakdown Table -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-layer-group"></i> Technology Stack Breakdown</h4>
        <table class="cs-table">
          <thead>
            <tr><th>Layer</th><th>Technologies</th></tr>
          </thead>
          <tbody>
            <tr><td><strong>Frontend</strong></td><td>React, Modern CSS3, HTML5</td></tr>
            <tr><td><strong>Backend</strong></td><td>Python, Django, Django REST Framework</td></tr>
            <tr><td><strong>Database</strong></td><td>PostgreSQL (ACID, Relational, Indexing)</td></tr>
            <tr><td><strong>Background Jobs & Cache</strong></td><td>Celery, Redis Message Broker</td></tr>
            <tr><td><strong>Desktop & Mobile</strong></td><td>Electron (Desktop), React Native (Android)</td></tr>
            <tr><td><strong>Deployment & Infrastructure</strong></td><td>Docker, Nginx, Gunicorn, Linux VPS</td></tr>
            <tr><td><strong>Version Control</strong></td><td>Git, GitHub</td></tr>
          </tbody>
        </table>
      </div>

      <!-- 8. Engineering Evolution Flow -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-chart-line"></i> Engineering Evolution</h4>
        <div class="cs-ascii-box">Initial Data Management ──► Authentication ──► Role-Based Access ──► Workflow Management
                                                                                   │
                                                                                   ▼
Production Operations ◄── Cross-Platform Clients ◄── Background Processing ◄── Bulk Import/Export</div>
      </div>

      <!-- 9. 5 Real Engineering Challenges -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-tools"></i> 5 Real Engineering Challenges Overcome</h4>
        <div class="cs-challenge-card">
          <div class="cs-challenge-title">1. Large Dataset Operations</div>
          <p>Users needed to search, filter, sort, verify, and approve 136K+ card records without UI lag. Solved via database indexing, query optimization, and bulk SQL updates.</p>
        </div>
        <div class="cs-challenge-card">
          <div class="cs-challenge-title">2. Multi-User Operations & RBAC</div>
          <p>Prevented unauthorized operations across organizations with an explicit permission matrix enforced at both API serializers and service layers.</p>
        </div>
        <div class="cs-challenge-card">
          <div class="cs-challenge-title">3. Long-Running Operations</div>
          <p>Moving multi-thousand record exports and photo calibrations into Celery background workers decoupled user actions from HTTP response timeouts.</p>
        </div>
        <div class="cs-challenge-card">
          <div class="cs-challenge-title">4. Source Data Quality & Deduplication</div>
          <p>Implemented checksum duplicate detection and pre-generation validation checks to eliminate missing photographs and corrupt rows before printing.</p>
        </div>
        <div class="cs-challenge-card">
          <div class="cs-challenge-title">5. Real Production Reliability</div>
          <p>Refined error handling, graceful fallback for malformed spreadsheets, and seamless rolling updates on production Linux servers.</p>
        </div>
      </div>

      <!-- 10. Key Architectural Decisions -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-brain"></i> Key Architectural Decisions</h4>
        <div class="cs-grid-2">
          <div class="cs-decision-card">
            <div class="cs-decision-header"><i class="fab fa-python"></i> Why Django & DRF?</div>
            <p>Provided a mature ORM, built-in security protections, robust admin interface, and standardized REST API endpoints for multiple client platforms.</p>
          </div>
          <div class="cs-decision-card">
            <div class="cs-decision-header"><i class="fas fa-database"></i> Why PostgreSQL?</div>
            <p>Strict ACID guarantees, relational integrity for multi-tenant data, fast B-tree indexing on search fields, and battle-tested production reliability.</p>
          </div>
          <div class="cs-decision-card">
            <div class="cs-decision-header"><i class="fas fa-bolt"></i> Why Redis & Celery?</div>
            <p>Eliminated web request blocking during heavy image finishing, PDF compilation, and bulk imports by queuing tasks in background workers.</p>
          </div>
          <div class="cs-decision-card">
            <div class="cs-decision-header"><i class="fas fa-layer-group"></i> Why API-First Architecture?</div>
            <p>Allowed React Web, Electron Desktop, and Android to share identical business rules, validation schemas, and database transactions.</p>
          </div>
        </div>
      </div>

      <!-- 11. End-to-End Ownership Summary -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-award"></i> Software Engineer Ownership Summary</h4>
        <div class="cs-highlight-box green">
          <div class="cs-highlight-title"><i class="fas fa-check-circle"></i> End-to-End Responsibility</div>
          <p>Responsible for CardFlow from concept to production: architecture, database design, backend APIs, frontend, authentication, background workers, deployment, and ongoing optimization. Handling 1,000+ users, 136K+ records, 86K+ downloads, and 435+ Android installs in real production.</p>
        </div>
      </div>
    </div>
  `,
  VidyaMaxx: `
    <div class="case-study-container">
      <!-- 1. Hero & Status -->
      <div class="case-study-hero-banner">
        <div class="case-study-badge"><i class="fas fa-flask"></i> MVP / Pilot Testing</div>
        <h3 class="case-study-headline">VidyaMaxx — AI-First Unified School Management Platform</h3>
        <p class="case-study-lead">VidyaMaxx is an AI-first school management platform designed to bring academic management, administration, communication, student information, and day-to-day school operations into a unified digital ecosystem across web and desktop.</p>
      </div>

      <!-- Links Row -->
      <div class="cs-links-row">
        <span style="font-size: 12px; font-weight: 600; color: #a78bfa;"><i class="fas fa-link"></i> Platform & Links:</span>
        <a href="https://github.com/logicbyroshan/vidyamaxx-school-management-saas.git" target="_blank" rel="noopener noreferrer" class="cs-link-pill primary"><i class="fab fa-github"></i> GitHub Repository</a>
        <span class="cs-link-pill secondary"><i class="fas fa-globe"></i> Web: Available</span>
        <span class="cs-link-pill secondary"><i class="fas fa-desktop"></i> Desktop: Available</span>
        <span class="cs-link-pill secondary"><i class="fab fa-android"></i> Android / iOS: Planned</span>
      </div>

      <!-- 2. Pilot Stage & Validation Focus -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-vial"></i> Current Status & Pilot Validation</h4>
        <div class="cs-two-col">
          <div class="cs-col-box cs-solution-box">
            <div class="cs-col-header"><i class="fas fa-school"></i> Partner School Demonstrations</div>
            <p class="cs-text">Demonstrated through live development environments to selected partner schools, allowing educators and administrators to validate workflows, usability, and operational throughput before production rollout.</p>
          </div>
          <div class="cs-col-box cs-problem-box">
            <div class="cs-col-header"><i class="fas fa-bullseye"></i> Current Phase Focus</div>
            <p class="cs-text">Validating multi-role permissions, grading schemas, automated timetabling constraints, parent-teacher communication loops, and predictive student progress tracking.</p>
          </div>
        </div>
      </div>

      <!-- 3. The Problem of Fragmentation -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-crosshairs"></i> The Problem: Fragmented Legacy Systems</h4>
        <div class="cs-two-col">
          <div class="cs-col-box cs-problem-box">
            <div class="cs-col-header"><i class="fas fa-exclamation-triangle"></i> Distributed School Bottlenecks</div>
            <ul class="cs-list cs-list-problem">
              <li>Disconnected databases for attendance, grades, and fees</li>
              <li>Duplicated manual data entry across disparate departments</li>
              <li>Zero unified visibility for principals and administrators</li>
              <li>Isolated communication channels causing parent friction</li>
              <li>Lack of predictive intelligence for struggling students</li>
            </ul>
          </div>
          <div class="cs-col-box cs-solution-box">
            <div class="cs-col-header"><i class="fas fa-check-circle"></i> Connected VidyaMaxx Operating System</div>
            <ul class="cs-list cs-list-solution">
              <li>Unified relational data model with shared business rules</li>
              <li>Single source of truth for student & staff lifecycles</li>
              <li>Real-time administrative dashboards and reporting</li>
              <li>AI-assisted analytics predicting academic needs early</li>
              <li>Cross-platform access for Web, Desktop, and Mobile</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- 4. Product Vision & Architecture Flowchart -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-sitemap"></i> Product Vision & Connected Data Architecture</h4>
        <div class="cs-ascii-box">                    VidyaMaxx Platform
                            │
            ┌───────────────┼────────────────┐
            ↓               ↓                ↓
       Academics       Administration    Communication
            │               │                │
            └───────────────┼────────────────┘
                            ↓
                    Unified School Data
                            ↓
                      AI Capabilities (Predictive Learning Analytics)</div>
      </div>

      <!-- 5. Core Functional Modules -->
      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-cubes"></i> Core Functional Modules</h4>
        <div class="cs-grid-2">
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-book-reader"></i> Academic Operations</div>
            <p>Course planning, automated clash-free timetable generator, configurable grading rubrics, exam scheduling, and automated report card printing.</p>
          </div>
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-id-badge"></i> Student & Staff SIS</div>
            <p>Complete student lifecycle records, digital admissions, biometric/digital attendance logs, and staff payroll/leave tracking.</p>
          </div>
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-brain"></i> AI Insights Engine</div>
            <p>Machine learning models detect learning pattern anomalies early, recommending targeted interventions and customized study plans.</p>
          </div>
          <div class="cs-card-sm">
            <div class="cs-card-sm-title"><i class="fas fa-shield-alt"></i> Multi-Tenancy & Security</div>
            <p>Isolated organizational tenancy ensuring FERPA and strict privacy compliance with granular role-based permissions.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  PrintNexx: `
    <div class="case-study-container">
      <div class="case-study-hero-banner">
        <div class="case-study-badge"><i class="fas fa-cogs"></i> Internal Production System</div>
        <h3 class="case-study-headline">PrintNexx — Automated Image Processing & Card Generation Engine</h3>
        <p class="case-study-lead">High-throughput internal engineering tool built with Python and OpenCV to automate mass photo preparation, facial bounding-box centering, portrait calibration, and batch print production.</p>
      </div>

      <div class="case-study-section">
        <h4 class="case-study-sec-title"><i class="fas fa-microchip"></i> Engineering Highlights</h4>
        <div class="cs-roles-grid">
          <div class="cs-role-card">
            <div class="cs-role-title"><i class="fas fa-camera"></i> Computer Vision Pipeline</div>
            <p>OpenCV face detection algorithms automatically align portrait angles and balance brightness/contrast.</p>
          </div>
          <div class="cs-role-card">
            <div class="cs-role-title"><i class="fas fa-print"></i> Print Calibration</div>
            <p>Converts arbitrary aspect ratios to exact thermal dye-sublimation print dimensions at 300 DPI.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  EazeTrip: `
    <div class="case-study-container">
      <div class="case-study-hero-banner">
        <div class="case-study-badge"><i class="fas fa-briefcase"></i> Commercial Client Project</div>
        <h3 class="case-study-headline">EazeTrip — Tour & Travel Operations Management Suite</h3>
        <p class="case-study-lead">Custom travel platform developed for an active tour agency to handle dynamic pricing, customer bookings, itinerary workflows, and automated invoice dispatches.</p>
      </div>
    </div>
  `,
  TaskFlixx: `
    <div class="case-study-container">
      <div class="case-study-hero-banner">
        <div class="case-study-badge"><i class="fas fa-check-double"></i> Open Source Product</div>
        <h3 class="case-study-headline">TaskFlixx — Intelligent AI-Powered Task & Workflow Manager</h3>
        <p class="case-study-lead">Smart task management application integrating LLMs for automatic goal breakdown, effort estimations, and intelligent backlog scheduling.</p>
      </div>
    </div>
  `,
  PrepSarthi: `
    <div class="case-study-container">
      <div class="case-study-hero-banner">
        <div class="case-study-badge"><i class="fas fa-book-open"></i> Open Source EdTech</div>
        <h3 class="case-study-headline">PrepSarthi — AI-Assisted Study & Exam Preparation Platform</h3>
        <p class="case-study-lead">Interactive learning platform offering AI concept drills, structured practice roadmaps, and personalized feedback loops for test takers.</p>
      </div>
    </div>
  `,
};

export const STATIC_PROJECTS = [
  {
    title: 'CardFlow',
    project_name: 'CardFlow',
    description: 'Production ID card management platform built for schools and organizations, covering data management, automated workflows, card generation and cross-platform operations.',
    category: { name: 'Enterprise SaaS' },
    status: '🟢 Production',
    status_class: 'status-prod',
    technologies_list: ['Django', 'React', 'PostgreSQL', 'Redis', 'Celery'],
    thumbnail: '/static/images/cardflow-banner.webp',
    github_url: 'https://github.com/logicbyroshan/cardfloww-idcard-management-saas.git',
    has_github: true,
    live_url: 'https://logicbyroshan.in/#projects',
    primary_btn: 'Case Study',
  },
  {
    title: 'VidyaMaxx',
    project_name: 'VidyaMaxx',
    description: 'AI-integrated school management platform bringing academics, administration, communication and school operations into one system.',
    category: { name: 'AI-Integrated SaaS' },
    status: '🟡 Pilot Testing',
    status_class: 'status-pilot',
    technologies_list: ['Django', 'React', 'PostgreSQL', 'Redis', 'AI'],
    thumbnail: '/static/images/vidyamaxx-banner.webp',
    github_url: 'https://github.com/logicbyroshan/vidyamaxx-school-management-saas.git',
    has_github: true,
    live_url: 'https://logicbyroshan.in/#projects',
    primary_btn: 'Case Study',
  },
  {
    title: 'PrintNexx',
    project_name: 'PrintNexx',
    description: 'Internal image-processing and card-generation tool built to automate photo preparation, image finishing and ID card generation workflows.',
    category: { name: 'Internal Engineering Tool' },
    status: '🟢 In Active Use',
    status_class: 'status-prod',
    technologies_list: ['Python', 'OpenCV', 'Image Processing', 'Automation'],
    thumbnail: null,
    has_github: false,
    secondary_btn: 'Technical Overview',
    primary_btn: 'Case Study',
  },
  {
    title: 'EazeTrip',
    project_name: 'EazeTrip',
    description: 'Travel management platform developed for a tour agency to manage customers, bookings, tours and operational workflows.',
    category: { name: 'Client Project' },
    status: '🟢 Production',
    status_class: 'status-prod',
    technologies_list: ['Django', 'React', 'PostgreSQL', 'REST API', 'AI'],
    thumbnail: null,
    has_github: false,
    live_url: 'https://logicbyroshan.in/#projects',
    primary_btn: 'Case Study',
  },
  {
    title: 'TaskFlixx',
    project_name: 'TaskFlixx',
    description: 'AI-powered task management application designed to combine everyday task organization with intelligent productivity workflows.',
    category: { name: 'AI Productivity' },
    status: '🟢 Live',
    status_class: 'status-prod',
    technologies_list: ['Django', 'React', 'PostgreSQL', 'AI', 'REST API'],
    thumbnail: null,
    github_url: 'https://github.com/logicbyroshan',
    has_github: true,
    primary_btn: 'Case Study',
  },
  {
    title: 'PrepSarthi',
    project_name: 'PrepSarthi',
    description: 'AI-powered learning and preparation platform designed to help users organize study workflows, practice concepts and prepare more effectively.',
    category: { name: 'AI Learning Platform' },
    status: '🔵 Open Source',
    status_class: 'status-oss',
    technologies_list: ['Python', 'Django', 'React', 'PostgreSQL', 'AI'],
    thumbnail: null,
    github_url: 'https://github.com/logicbyroshan',
    has_github: true,
    primary_btn: 'Case Study',
  },
];

const STATIC_SKILL_CARDS = [
  {
    title: 'Software Engineering',
    icon: 'fa-puzzle-piece',
    skills: ['Python', 'Java', 'C/C++', 'JavaScript', 'Django', 'FastAPI', 'Flask', 'Node.js', 'REST APIs', 'System Design', 'Git'],
  },
  {
    title: 'AI & Data',
    icon: 'fa-robot',
    skills: ['LLMs', 'RAG', 'AI Agents', 'AI Workflows', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'NumPy', 'Pandas', 'ML'],
  },
  {
    title: 'Application Development',
    icon: 'fa-globe',
    skills: ['React', 'Vue', 'HTML/CSS', 'Tailwind', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'React Native', 'Electron'],
  },
  {
    title: 'Infrastructure & Systems',
    icon: 'fa-cloud',
    skills: ['Docker', 'Nginx', 'Gunicorn', 'Linux', 'Celery', 'Redis', 'GitHub Actions', 'CI/CD', 'Deployment', 'Background Jobs'],
  },
];

function updateSkills(skills) {
  const container = document.querySelector('.skills-grid');
  if (!container) return;

  const validSkills = Array.isArray(skills) ? skills.filter(Boolean) : [];
  if (!validSkills.length) {
    container.innerHTML = STATIC_SKILL_CARDS
      .map(
        (card) => `
        <div class="tech-card">
          <div class="tech-icon-wrapper">
            <i class="fas ${card.icon}"></i>
          </div>
          <h3 class="tech-card-title">${escapeHtml(card.title)}</h3>
          <ul class="skills-list">
            ${card.skills.map((skill) => `<li>${escapeHtml(skill)}</li>`).join('')}
          </ul>
        </div>
      `
      )
      .join('');
    return;
  }

  const grouped = validSkills.reduce((acc, skill) => {
    const category = skill.category?.name || 'Other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {});

  container.innerHTML = Object.entries(grouped)
    .map(([category, items]) => {
      const card = STATIC_SKILL_CARDS.find((c) => c.title === category) || {
        icon: 'fa-code',
        title: category,
      };
      const listItems = items.map((s) => `<li>${escapeHtml(s.name)}</li>`).join('');
      return `
        <div class="tech-card">
          <div class="tech-icon-wrapper">
            <i class="fas ${card.icon}"></i>
          </div>
          <h3 class="tech-card-title">${escapeHtml(category)}</h3>
          <ul class="skills-list">${listItems}</ul>
        </div>
      `;
    })
    .join('');
}

export function getCombinedProjects(projects = []) {
  const validLiveProjects = Array.isArray(projects) ? projects.filter(Boolean) : [];

  if (validLiveProjects.length >= STATIC_PROJECTS.length) {
    return validLiveProjects.slice(0, 8);
  }
  if (validLiveProjects.length > 0) {
    const neededStaticCount = Math.max(0, STATIC_PROJECTS.length - validLiveProjects.length);
    return [
      ...validLiveProjects,
      ...STATIC_PROJECTS.slice(validLiveProjects.length, validLiveProjects.length + neededStaticCount),
    ];
  }
  return STATIC_PROJECTS;
}

const UNIVERSAL_GRADIENTS = [
  'universal-gradient-1',
  'universal-gradient-2',
  'universal-gradient-3',
  'universal-gradient-4',
  'universal-gradient-5',
];

const UNIVERSAL_ICONS = [
  'fa-cogs',
  'fa-plane',
  'fa-tasks',
  'fa-graduation-cap',
  'fa-cubes',
  'fa-code',
];

function updateProjects(projects = []) {
  const slider = document.querySelector('.projects-slider');
  if (!slider) return;

  const combinedProjects = getCombinedProjects(projects);

  // Display status lookup: maps project name → display label & badge class
  const PROJECT_DISPLAY_STATUS = {
    'CardFlow':   { text: '🟢 Production',    cls: 'status-prod'  },
    'VidyaMaxx':  { text: '🟡 Pilot Testing',  cls: 'status-pilot' },
    'PrintNexx':  { text: '🟢 In Active Use',  cls: 'status-prod'  },
    'EazeTrip':   { text: '🟢 Production',    cls: 'status-prod'  },
    'TaskFlixx':  { text: '🟢 Live',           cls: 'status-prod'  },
    'PrepSarthi': { text: '🔵 Open Source',    cls: 'status-oss'   },
  };

  slider.innerHTML = combinedProjects
    .map((project, index) => {
      const projectName = project.project_name || project.title;
      const staticProject = STATIC_PROJECTS.find((p) => p.project_name === projectName || p.title === projectName);
      const categoryName = project.category?.name || staticProject?.category?.name || 'Enterprise SaaS';

      // Normalize technologies_list (API may return array, static has array)
      let techList = project.technologies_list || staticProject?.technologies_list || [];
      if (typeof techList === 'string') {
        techList = techList.split(',').map((t) => t.trim()).filter(Boolean);
      }

      // Resolve display status — prefer explicit display format, fallback to lookup, then default
      const hasDisplayStatus = project.status && /[🟢🟡🔵🔴🟠]/u.test(project.status);
      const displayStatusInfo = PROJECT_DISPLAY_STATUS[projectName] || {};
      const statusText = hasDisplayStatus ? project.status : (displayStatusInfo.text || '🟢 Production');
      const statusClass = project.status_class || displayStatusInfo.cls || 'status-prod';

      const projectSlug = encodeURIComponent((projectName || '').toLowerCase().replace(/[^a-z0-9]/g, ''));
      const githubLink = safeUrl(project.github_url || staticProject?.github_url || 'https://github.com/logicbyroshan');
      const hasGithub = project.has_github ?? (Boolean(githubLink) && !githubLink.includes('#') && githubLink !== 'https://github.com/logicbyroshan');
      const secondaryBtn = project.secondary_btn || (hasGithub ? '' : 'Live Preview');

      let buttonsHtml = `<a href="/projects/${projectSlug}" class="btn btn-primary project-btn project-page-link" data-project-slug="${projectSlug}">Case Study</a>`;
      if (hasGithub) {
        buttonsHtml += `<a href="${escapeHtml(githubLink)}" class="github-btn" target="_blank" rel="noopener noreferrer" aria-label="Open project repository"><i class="fab fa-github"></i></a>`;
      } else if (secondaryBtn === 'Technical Overview') {
        buttonsHtml += `<a href="/projects/${projectSlug}" class="btn btn-secondary project-page-link" data-project-slug="${projectSlug}">Technical Overview</a>`;
      } else if (secondaryBtn === 'Live Preview') {
        buttonsHtml += `<a href="https://logicbyroshan.in/#projects" class="btn btn-secondary" target="_blank" rel="noopener noreferrer">Live Preview</a>`;
      }

      const gradClass = UNIVERSAL_GRADIENTS[index % UNIVERSAL_GRADIENTS.length];
      const iconClass = UNIVERSAL_ICONS[index % UNIVERSAL_ICONS.length];
      const thumbTechPills = techList.slice(0, 5).map(t => `<span class="universal-thumb-tech-pill">${escapeHtml(t)}</span>`).join('');

      // Use JS case-study doc first; fall back to DB documentation
      const docHtml = PROJECT_DOCUMENTATION[projectName]
        || PROJECT_DOCUMENTATION[project.title]
        || project.documentation
        || '';

      return `
        <div class="project-card ${index === 0 ? 'active' : ''}" data-index="${index}" data-project-slug="${projectSlug}">
          <div class="project-doc-content" style="display:none;">${docHtml}</div>
          <div class="universal-project-thumb ${gradClass}">
            <div class="universal-thumb-bg-pattern"></div>
            <i class="fas ${iconClass} universal-thumb-watermark"></i>
            <div class="universal-thumb-content">
              <div class="project-meta-row" style="justify-content: center; margin-bottom: 4px;">
                <span class="universal-thumb-tag">${escapeHtml(categoryName)}</span>
                <span class="project-status-badge ${statusClass}">${escapeHtml(statusText)}</span>
              </div>
              <h3 class="universal-thumb-title">${escapeHtml(projectName)}</h3>
              <p class="universal-thumb-sub">${escapeHtml(project.description || '')}</p>
              <div class="universal-thumb-tech-row">${thumbTechPills}</div>
              <div class="universal-thumb-buttons">
                ${buttonsHtml}
              </div>
            </div>
            <span class="project-category">${escapeHtml(categoryName)}</span>
          </div>
        </div>
      `;
    })
    .join('');

  if (typeof window !== 'undefined' && typeof window.initProjectsSlider === 'function') {
    window.initProjectsSlider();
  }
}

function updateExperience(experience) {
  if (!experience || !experience.length) return;

  const timeline = document.querySelector('.roadmap-timeline');
  if (!timeline) return;

  const items = experience.slice(0, 6);
  const timelineLine = '<div class="timeline-line"></div>';

  const rows = items
    .map((item, index) => {
      const sideClass = index % 2 === 0 ? 'roadmap-left' : 'roadmap-right';
      const description = item.short_description || item.detailed_description || '';
      const companyHtml = item.company_name
        ? `<div class="roadmap-company"><i class="fas fa-building"></i> ${escapeHtml(item.company_name)}</div>`
        : '';

      return `
        <div class="roadmap-item ${sideClass} animate">
          <div class="roadmap-card">
            <span class="roadmap-date">${escapeHtml(formatDateRange(item.start_date, item.end_date, item.currently_working))}</span>
            <h3 class="roadmap-title">${escapeHtml(item.position)}</h3>
            ${companyHtml}
            <p class="roadmap-description">${escapeHtml(description)}</p>
          </div>
          <div class="roadmap-dot"></div>
        </div>
      `;
    })
    .join('');

  timeline.innerHTML = `${timelineLine}${rows}`;

  if (typeof window !== 'undefined' && typeof window.initRoadmapSection === 'function') {
    window.initRoadmapSection();
  }
}

export function hydratePortfolioDom(data) {
  updateSeoMetadata(data?.profile, data?.projects || []);
  updateProfile(data?.profile);
  updateSkills(data?.skills || []);
  updateProjects(data?.projects || []);
  updateExperience(data?.experience || []);
}

export { STATIC_SKILL_CARDS, updateProjects, updateSkills };
