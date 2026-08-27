import React, { useState, useEffect } from 'react';
import { STATIC_PROJECTS, PROJECT_DOCUMENTATION } from '../api/hydratePortfolio';
import { ALL_PROJECT_DOCS } from '../api/projectDocData';
import MermaidDiagram from '../components/doc/MermaidDiagram';
import CodeBlockShiki from '../components/doc/CodeBlockShiki';
import KaTeXFormula from '../components/doc/KaTeXFormula';
import InteractiveArchitecture from '../components/doc/InteractiveArchitecture';
import ComplexDiagramD2 from '../components/doc/ComplexDiagramD2';
import ImageLightbox from '../components/doc/ImageLightbox';
import VideoShowcase from '../components/doc/VideoShowcase';

const PROJECT_GALLERIES = {
  cardflow: [
    {
      src: '/static/images/cardflow-banner.webp',
      title: 'CardFlow Enterprise Production Dashboard',
      caption: 'Full-stack production dashboard managing 136K+ ID card records and multi-school workflows.'
    },
    {
      src: '/static/images/screenshot_documentation.png',
      title: 'Automated Processing Engine',
      caption: 'High-throughput batch image processing, face alignment, and dynamic ID template composition.'
    },
    {
      src: '/static/images/screenshot_projects.png',
      title: 'Multi-Tenant RBAC & Analytics',
      caption: 'Role-based access control, real-time activity tracking, and cross-platform synchronization.'
    }
  ],
  vidyamaxx: [
    {
      src: '/static/images/vidyamaxx-banner.webp',
      title: 'AI-First School Management Dashboard',
      caption: 'Integrated academic ecosystem connecting administrators, educators, students, and parents.'
    },
    {
      src: '/static/images/screenshot_rexi_ai.png',
      title: 'Intelligent Academic Analytics',
      caption: 'Predictive performance modeling, automated timetable scheduling, and progress tracking.'
    },
    {
      src: '/static/images/screenshot_hero.png',
      title: 'Unified Communication Hub',
      caption: 'Multi-channel messaging, real-time announcements, and institutional report generation.'
    }
  ],
  printnexx: [
    {
      src: '/static/images/screenshot_documentation.png',
      title: 'Internal Automation Engine',
      caption: 'High-speed image pre-processing, face alignment, and dynamic ID template compositor.'
    },
    {
      src: '/static/images/cardflow-banner.webp',
      title: 'Batch Finishing Pipeline',
      caption: 'Automated print-ready output rendering and multi-format asset export.'
    }
  ],
  eazetrip: [
    {
      src: '/static/images/ecom.webp',
      title: 'Tour Agency Operations & Booking',
      caption: 'Customer booking management, interactive tour itineraries, and automated payment receipts.'
    },
    {
      src: '/static/images/faqside.webp',
      title: 'Itinerary Planner & Package Customizer',
      caption: 'Dynamic travel package creation and real-time scheduling dashboard.'
    }
  ],
  taskflixx: [
    {
      src: '/static/images/task.webp',
      title: 'AI Task Management Workspace',
      caption: 'Context-aware task prioritization, workflow pipelines, and daily productivity insights.'
    },
    {
      src: '/static/images/hero.webp',
      title: 'Productivity Analytics',
      caption: 'Sprint tracking, team velocity estimation, and task automation.'
    }
  ],
  prepsarthi: [
    {
      src: '/static/images/screenshot_documentation.png',
      title: 'AI Study & Prep Engine',
      caption: 'Adaptive practice tests, spaced repetition flashcards, and concept mastery tracking.'
    },
    {
      src: '/static/images/vidyamaxx-banner.webp',
      title: 'Interactive Learning Workspace',
      caption: 'Intelligent concept summarization and instant mock test evaluation.'
    }
  ]
};

export default function ProjectDetailPage({ slug, onNavigate }) {
  const [activeSlide, setActiveSlide] = useState(0);

  // Normalize slug and find project
  const cleanSlug = String(slug || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  
  const currentIndex = STATIC_PROJECTS.findIndex(p => {
    const pSlug = (p.project_name || p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return pSlug === cleanSlug || cleanSlug.includes(pSlug) || pSlug.includes(cleanSlug);
  });

  const projectIndex = currentIndex >= 0 ? currentIndex : 0;
  const project = STATIC_PROJECTS[projectIndex] || STATIC_PROJECTS[0];

  const prevProject = STATIC_PROJECTS[(projectIndex - 1 + STATIC_PROJECTS.length) % STATIC_PROJECTS.length];
  const nextProject = STATIC_PROJECTS[(projectIndex + 1) % STATIC_PROJECTS.length];

  const projectName = project?.project_name || project?.title || 'CardFlow';
  const categoryName = project?.category?.name || 'Enterprise SaaS';
  const projectKey = (projectName || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const docData = ALL_PROJECT_DOCS[projectKey] || ALL_PROJECT_DOCS.cardflow;
  const rawHtmlDoc = PROJECT_DOCUMENTATION[projectName] || PROJECT_DOCUMENTATION[project?.title] || project?.documentation || '';
  const gallery = PROJECT_GALLERIES[projectKey] || PROJECT_GALLERIES.cardflow;

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = `${projectName} Technical Documentation & Case Study | Roshan Damor`;
    setActiveSlide(0);
  }, [projectName]);

  const getSlugOf = (p) => (p.project_name || p.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % gallery.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Project Hero Header */}
        <header className="page-hero">
          <span className="page-badge">
            <i className="fas fa-folder-open"></i> {categoryName}
          </span>
          <h1 className="page-title">
            {projectName} <span className="text-gradient">Technical Documentation</span>
          </h1>
          <p className="page-subtitle">
            {docData.tagline || project?.description}
          </p>
        </header>

        {/* Unified Documentation Container */}
        <div className="project-detail-hero-card">
          {/* Screenshot Slider Gallery */}
          <div className="project-screenshot-slider">
            <div className="screenshot-slide-stage">
              <img
                src={gallery[activeSlide].src}
                alt={gallery[activeSlide].title}
                className="screenshot-slide-img"
              />
              <div className="screenshot-slide-overlay">
                <div className="screenshot-slide-info">
                  <span className="screenshot-slide-badge">
                    <i className="fas fa-image"></i> Screenshot {activeSlide + 1} of {gallery.length}
                  </span>
                  <h3 className="screenshot-slide-title">{gallery[activeSlide].title}</h3>
                  <p className="screenshot-slide-caption">{gallery[activeSlide].caption}</p>
                </div>
              </div>
            </div>

            {/* Slider Controls */}
            {gallery.length > 1 && (
              <>
                <button
                  type="button"
                  className="screenshot-nav-btn prev"
                  onClick={prevSlide}
                  aria-label="Previous screenshot"
                >
                  <i className="fas fa-chevron-left"></i>
                </button>
                <button
                  type="button"
                  className="screenshot-nav-btn next"
                  onClick={nextSlide}
                  aria-label="Next screenshot"
                >
                  <i className="fas fa-chevron-right"></i>
                </button>
                
                {/* Dots / Indicators */}
                <div className="screenshot-dots-row">
                  {gallery.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      className={`screenshot-dot ${idx === activeSlide ? 'active' : ''}`}
                      onClick={() => setActiveSlide(idx)}
                      aria-label={`Go to screenshot ${idx + 1}`}
                    />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Meta Row with Status, Links & Stats */}
          <div className="project-detail-header-info">
            <div className="project-detail-meta-row">
              <div>
                <span className={`project-status-badge ${docData.statusClass || 'status-prod'}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
                  {docData.status || project?.status || '🟢 Production'}
                </span>
              </div>
              <div className="project-detail-links">
                {docData.githubUrl && (
                  <a
                    href={docData.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs-link-pill secondary"
                  >
                    <i className="fab fa-github"></i> GitHub Repo
                  </a>
                )}
                {docData.liveUrl && (
                  <a
                    href={docData.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs-link-pill primary"
                  >
                    <i className="fas fa-globe"></i> Live Application
                  </a>
                )}
              </div>
            </div>

            {/* Tech Stack List */}
            <div className="project-detail-tech-stack">
              {(project?.technologies_list || []).map((t, idx) => (
                <span key={idx} className="project-tech-badge" style={{ fontSize: '13px', padding: '6px 14px' }}>
                  {t}
                </span>
              ))}
            </div>

            {/* Key Metrics Grid */}
            {docData.stats && docData.stats.length > 0 && (
              <div className="doc-stats-grid" style={{ marginTop: '20px' }}>
                {docData.stats.map((s, idx) => (
                  <div key={idx} className="doc-stat-box">
                    <span className="doc-stat-val">{s.value}</span>
                    <span className="doc-stat-lbl">{s.label}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
             UNIFIED SINGLE-DOCUMENTATION FLOW (ALL SECTIONS RENDERED)
             ══════════════════════════════════════════════════════════════ */}

          {/* 1. Executive Overview & Problem Context */}
          <section id="doc-overview" className="doc-page-section">
            <div className="doc-section-heading-wrap">
              <span className="doc-badge-pill">
                <i className="fas fa-book-open"></i> Section 1: Executive Overview
              </span>
              <h2 className="doc-section-title">Context, Problem Statement &amp; Architecture Strategy</h2>
            </div>
            
            {docData.overviewHtml ? (
              <div dangerouslySetInnerHTML={{ __html: docData.overviewHtml }} />
            ) : rawHtmlDoc ? (
              <div className="case-study-injected" dangerouslySetInnerHTML={{ __html: rawHtmlDoc }} />
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '15px', lineHeight: '1.65' }}>
                {project?.description}
              </p>
            )}
          </section>

          {/* 2. Interactive System Architecture Topology (React Flow & D2) */}
          <section id="doc-architecture" className="doc-page-section">
            <div className="doc-section-heading-wrap">
              <span className="doc-badge-pill">
                <i className="fas fa-network-wired"></i> Section 2: Interactive Architecture
              </span>
              <h2 className="doc-section-title">High-Availability Topology &amp; Security Rings</h2>
            </div>
            <InteractiveArchitecture />
            <ComplexDiagramD2 scenarioKey={projectKey} />
          </section>

          {/* 3. Engineering Flowcharts & Relational Schema (Mermaid) */}
          <section id="doc-diagrams" className="doc-page-section">
            <div className="doc-section-heading-wrap">
              <span className="doc-badge-pill">
                <i className="fas fa-project-diagram"></i> Section 3: Engineering Diagrams
              </span>
              <h2 className="doc-section-title">Lifecycle State Machine &amp; Database Entity Relationships</h2>
            </div>
            
            {docData.flowchart && (
              <MermaidDiagram 
                chart={docData.flowchart}
                diagramType="Flowchart"
                title={`${projectName} End-to-End Processing & Workflow Pipeline`}
                subtitle="Visualizes data ingestion, validation state gates, background queues, and cloud storage sinks."
              />
            )}

            {docData.erd && (
              <MermaidDiagram 
                chart={docData.erd}
                diagramType="ERD"
                title={`${projectName} Multi-Tenant Relational Entity Model`}
                subtitle="Entity relationships illustrating foreign key constraints, ownership hierarchies, and audit logging trails."
              />
            )}
          </section>

          {/* 4. Production Code Implementation (Shiki) */}
          <section id="doc-code" className="doc-page-section">
            <div className="doc-section-heading-wrap">
              <span className="doc-badge-pill">
                <i className="fas fa-code"></i> Section 4: Production Implementation
              </span>
              <h2 className="doc-section-title">Core Algorithms, Serializers &amp; Partition Strategies</h2>
            </div>

            {docData.codeSamples && docData.codeSamples.map((sample, idx) => (
              <CodeBlockShiki 
                key={idx}
                code={sample.code}
                language={sample.language}
                filename={sample.filename}
                description={sample.description}
              />
            ))}
          </section>

          {/* 5. Mathematical Models & Performance Complexity (KaTeX) */}
          <section id="doc-math" className="doc-page-section">
            <div className="doc-section-heading-wrap">
              <span className="doc-badge-pill">
                <i className="fas fa-square-root-alt"></i> Section 5: Mathematical Models
              </span>
              <h2 className="doc-section-title">Throughput Capacity, Latency Budgets &amp; Algorithm Analysis</h2>
            </div>

            {docData.formulas && docData.formulas.map((item, idx) => (
              <KaTeXFormula 
                key={idx}
                formula={item.formula}
                title={item.title}
                description={item.description}
                variables={item.variables}
              />
            ))}
          </section>

          {/* 6. Media Gallery Lightbox & Video Showcase */}
          <section id="doc-media" className="doc-page-section">
            <div className="doc-section-heading-wrap">
              <span className="doc-badge-pill">
                <i className="fas fa-photo-video"></i> Section 6: Media &amp; Live Walkthrough
              </span>
              <h2 className="doc-section-title">Interactive Video Walkthrough &amp; High-Resolution Gallery</h2>
            </div>

            <VideoShowcase 
              posterSrc={gallery[0]?.src}
              title={`${projectName} Production Walkthrough & Interactive Demo`}
              duration="03:45"
              resolution="1080p 60fps"
            />

            <ImageLightbox 
              images={gallery}
              title={`${projectName} High-Resolution Screenshot Suite`}
            />
          </section>
        </div>

        {/* Project Discovery Navigator (Prev / Next) */}
        <div className="project-pagination-grid" style={{ marginTop: '40px' }}>
          <a
            href={`/projects/${getSlugOf(prevProject)}`}
            className="project-nav-card prev"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('project-detail', getSlugOf(prevProject));
            }}
          >
            <i className="fas fa-arrow-left" style={{ color: '#a78bfa', fontSize: '18px' }}></i>
            <div>
              <div className="project-nav-card-sub">Previous Project</div>
              <div className="project-nav-card-title">{prevProject.project_name || prevProject.title}</div>
            </div>
          </a>

          <a
            href={`/projects/${getSlugOf(nextProject)}`}
            className="project-nav-card next"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('project-detail', getSlugOf(nextProject));
            }}
          >
            <div>
              <div className="project-nav-card-sub">Next Project</div>
              <div className="project-nav-card-title">{nextProject.project_name || nextProject.title}</div>
            </div>
            <i className="fas fa-arrow-right" style={{ color: '#38bdf8', fontSize: '18px' }}></i>
          </a>
        </div>

        {/* Return Button */}
        <div style={{ textAlign: 'center', marginTop: '36px', marginBottom: '60px' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '14px 36px', fontSize: '15px' }}
            onClick={() => onNavigate('home', 'projects')}
          >
            <i className="fas fa-th-large" style={{ marginRight: '8px' }}></i> View All Projects
          </button>
        </div>
      </div>
    </div>
  );
}
