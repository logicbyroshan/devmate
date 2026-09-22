import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchProjectBySlug, fetchProjects, likeProject, viewProject } from '../api/portfolioApi';
import { safeUrl, resolveStatusDisplay } from '../api/hydratePortfolio';
import InteractiveArchitecture from '../components/doc/InteractiveArchitecture';
import ComplexDiagramD2 from '../components/doc/ComplexDiagramD2';
import MermaidDiagram from '../components/doc/MermaidDiagram';
import KaTeXFormula from '../components/doc/KaTeXFormula';
import ImageLightbox from '../components/doc/ImageLightbox';
import VideoShowcase from '../components/doc/VideoShowcase';
import '../../public/static/css/doc-engine.css';

const PROJECT_MERMAID_SCHEMAS = {
  cardflow: {
    type: 'ERD',
    title: 'CardFlow Multi-Tenant Entity-Relationship Model',
    subtitle: 'Strict relational schema with RBAC constraints, composite foreign keys, and audit logging tables.',
    chart: `erDiagram
      ORGANIZATION ||--o{ USER : contains
      ORGANIZATION ||--o{ STUDENT_RECORD : owns
      ORGANIZATION ||--o{ CARD_TEMPLATE : configures
      STUDENT_RECORD ||--o{ BATCH_ITEM : processes
      BATCH_EXPORT ||--|{ BATCH_ITEM : aggregates
      USER ||--o{ AUDIT_LOG : triggers
      STUDENT_RECORD ||--o{ AUDIT_LOG : tracks
      
      ORGANIZATION {
        uuid id PK
        string name
        string tenant_code UK
        string plan_tier
        timestamp created_at
      }
      USER {
        uuid id PK
        uuid org_id FK
        string email UK
        string role
        boolean is_active
      }
      STUDENT_RECORD {
        uuid id PK
        uuid org_id FK
        string admission_no UK
        string full_name
        string photo_url
        string workflow_state
        timestamp updated_at
      }
      BATCH_EXPORT {
        uuid id PK
        uuid org_id FK
        string format
        string status
        integer total_cards
      }`,
  },
  vidyamaxx: {
    type: 'Flowchart',
    title: 'VidyaMaxx Academic & AI Pipeline Lifecycle',
    subtitle: 'End-to-end data ingestion, genetic timetabling optimization, and contextual student performance RAG retrieval.',
    chart: `flowchart TD
      A[Student / Teacher Ingestion] --> B[Multi-Tenant Gateway]
      B --> C{RBAC & Permission Check}
      C -->|Authorized| D[Core Database & State Hub]
      C -->|Unauthorized| E[403 Forbidden]
      D --> F[Attendance & Biometric Stream]
      D --> G[Grading & Assessment Logs]
      D --> H[Genetic Timetable Optimizer]
      F & G --> I[pgvector Semantic Embedding Store]
      I --> J[Contextual RAG Retrieval Engine]
      J --> K[Qwen AI Student Progress Insights]
      H --> L[Optimized Class Schedule Output]`,
  },
  printnexx: {
    type: 'Flowchart',
    title: 'PrintNexx OpenCV High-DPI Image Transformation Pipeline',
    subtitle: 'Automated facial landmark detection, histogram equalization, margin compensation, and parallel thermal compilation.',
    chart: `flowchart LR
      Raw[Raw Camera Input] --> Detect[Haar Cascade Face Locator]
      Detect --> Align[Affine Rotation Normalizer]
      Align --> Hist[Histogram Equalization & Tone Curves]
      Hist --> Comp[3:4 Proportional Aspect Crop]
      Comp --> Render[300-DPI Thermal Canvas Compositor]
      Render --> Output[High-Res PDF Sheet Spooler]`,
  },
  eazetrip: {
    type: 'Flowchart',
    title: 'EazeTrip Real-Time Inventory & Distributed Lock Engine',
    subtitle: 'High-concurrency seat reservation workflow with Redis distributed locks and idempotent payment webhooks.',
    chart: `flowchart TD
      UserReq[Booking Request] --> APIGateway[API Gateway]
      APIGateway --> LockCheck{Redis Seat Lock Check}
      LockCheck -->|Acquired| HoldState[10-Minute Cart Hold Active]
      LockCheck -->|Conflict| LockWait[Return Concurrency Error]
      HoldState --> PayHook[Payment Gateway Webhook]
      PayHook --> ACIDCommit[PostgreSQL ACID Ticket Commit]
      ACIDCommit --> PDFGen[Automated Itinerary PDF Generator]
      PDFGen --> UserSuccess[User Confirmed Voucher]`,
  },
  taskflixx: {
    type: 'Flowchart',
    title: 'TaskFlixx Kanban State Machine & AI Urgency Pipeline',
    subtitle: 'Asynchronous task lifecycle transitions guarded by urgency estimators and periodic notification workers.',
    chart: `flowchart LR
      TaskCreated[Task Created] --> AIClassify[LLM Urgency Classifier]
      AIClassify --> StatePending[State: Pending]
      StatePending --> StateProg[State: In Progress]
      StateProg --> StateReview[State: AI Review & Verification]
      StateReview --> StateDone[State: Completed & Archived]
      StateProg --> AlertWorker[Celery Beat Reminder Dispatcher]`,
  },
  prepsarthi: {
    type: 'Flowchart',
    title: 'PrepSarthi Adaptive RAG & Spaced Repetition Workflow',
    subtitle: 'Vector similarity search against syllabus knowledge base and SM-2 adaptive interval scheduling.',
    chart: `flowchart TD
      StudentQuery[User Practice Topic] --> VectorSearch[Qdrant Semantic Similarity Search]
      VectorSearch --> KnowledgeContext[Syllabus Context Extraction]
      KnowledgeContext --> LLMGen[Dynamic Synthetic Question Generator]
      LLMGen --> StudentEval[Student Answer Evaluation]
      StudentEval --> SM2Algorithm[SuperMemo SM-2 Interval Calculation]
      SM2Algorithm --> AdaptiveQueue[Next Review Schedule Updated]`,
  },
};

const PROJECT_KATEX_MODELS = {
  cardflow: {
    title: 'High-Throughput Parallel Batch Generation Model',
    description: 'Mathematical formulation of asynchronous worker throughput and P99 latency bounds across Celery worker pools:',
    formula: '\\Phi_{\\text{throughput}} = \\frac{N_{\\text{cards}} \\times W_{\\text{concurrency}}}{T_{\\text{render}} + T_{\\text{io}}} \\ge 120 \\text{ cards/sec}, \\quad L_{p99} \\le 18\\text{ms}',
    variables: [
      { symbol: '\\Phi', meaning: 'Aggregate System Throughput', value: '120+ cards/sec' },
      { symbol: 'W_{\\text{concurrency}}', meaning: 'Active Celery Worker Pool', value: '16 workers' },
      { symbol: 'L_{p99}', meaning: '99th Percentile API Response Latency', value: '< 18ms' },
    ],
  },
  vidyamaxx: {
    title: 'Genetic Timetable Multi-Constraint Optimization Function',
    description: 'Fitness objective function balancing teacher schedules, room capacity, and subject distribution penalties:',
    formula: 'F(T) = \\sum_{i=1}^{M} w_i \\cdot C_i(T) - \\lambda \\sum_{j=1}^{K} P_j(T), \\quad \\text{subject to } P_{\\text{hard}}(T) = 0',
    variables: [
      { symbol: 'F(T)', meaning: 'Overall Schedule Fitness Score', value: 'Maximize' },
      { symbol: 'C_i(T)', meaning: 'Soft Constraint Satisfaction Factor', value: '0.0 to 1.0' },
      { symbol: 'P_{\\text{hard}}', meaning: 'Hard Constraint Violations (Teacher / Room clash)', value: '0 (Strict)' },
    ],
  },
  printnexx: {
    title: 'High-Resolution 300-DPI Affine Coordinate Normalization',
    description: 'Transformation matrix aligning facial landmarks to standardized thermal card printable boundaries:',
    formula: '\\begin{bmatrix} x\' \\\\ y\' \\\\ 1 \\end{bmatrix} = \\begin{bmatrix} s \\cos\\theta & -s \\sin\\theta & t_x \\\\ s \\sin\\theta & s \\cos\\theta & t_y \\\\ 0 & 0 & 1 \\end{bmatrix} \\begin{bmatrix} x \\\\ y \\\\ 1 \\end{bmatrix}',
    variables: [
      { symbol: 's', meaning: 'Isotropic Scale Factor', value: 'Aspect-Preserving' },
      { symbol: '\\theta', meaning: 'Facial Tilt Angle Correction', value: '[-45°, +45°]' },
      { symbol: '(t_x, t_y)', meaning: 'Center Translation Offset', value: 'Print Margin' },
    ],
  },
  eazetrip: {
    title: 'Token Bucket Rate Limiting & Concurrency Burst Formulation',
    description: 'Guarantees sub-millisecond API rate enforcement with burst protection for real-time booking checkouts:',
    formula: '\\beta(t) = \\min\\left(B, \\; \\beta(t_0) + r \\cdot (t - t_0)\\right) - 1, \\quad \\text{where } \\beta(t) \\ge 0',
    variables: [
      { symbol: 'B', meaning: 'Bucket Capacity Burst Limit', value: '100 requests' },
      { symbol: 'r', meaning: 'Refill Rate', value: '25 req/sec' },
      { symbol: '\\beta(t)', meaning: 'Available Token Balance', value: 'Redis Counter' },
    ],
  },
  taskflixx: {
    title: 'Dynamic Multi-Attribute Task Priority Scoring Metric',
    description: 'Algorithmic urgency evaluation weighting deadline proximity, business impact, and execution complexity:',
    formula: 'P(\\tau) = w_u \\cdot \\frac{1}{\\Delta t_{\\text{deadline}} + \\epsilon} + w_i \\cdot I(\\tau) - w_c \\cdot C(\\tau)',
    variables: [
      { symbol: 'P(\\tau)', meaning: 'Calculated Task Priority Score', value: 'Dynamic Rank' },
      { symbol: '\\Delta t', meaning: 'Time Remaining to Due Date', value: 'Hours' },
      { symbol: 'I(\\tau)', meaning: 'Projected Business Impact', value: '[1, 10]' },
    ],
  },
  prepsarthi: {
    title: 'SuperMemo SM-2 Spaced Repetition Memory Retention Model',
    description: 'Predictive interval formula scheduling optimal quiz review dates based on recall accuracy ratings:',
    formula: 'I(n) = \\begin{cases} 1, & n = 1 \\\\ 6, & n = 2 \\\\ I(n-1) \\times EF, & n > 2 \\end{cases} \\quad EF\' = \\max\\left(1.3, \\; EF + 0.1 - (5 - q)(0.08 + (5 - q)0.02)\\right)',
    variables: [
      { symbol: 'I(n)', meaning: 'Repetition Interval in Days', value: 'Dynamic' },
      { symbol: 'EF', meaning: 'Easiness Factor', value: 'Default 2.5' },
      { symbol: 'q', meaning: 'Student Recall Quality Rating', value: '[0, 5]' },
    ],
  },
};

export default function ProjectDetailPage({ slug, onNavigate }) {
  const [project, setProject] = useState(null);
  const [allProjects, setAllProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [likes, setLikes] = useState(0);
  const [views, setViews] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const cleanSlug = useMemo(() => {
    return String(slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
  }, [slug]);

  // Load project detail and all projects list
  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    setError(null);
    setActiveSlide(0);

    async function loadData() {
      try {
        const [projectsList, directProject] = await Promise.allSettled([
          fetchProjects(),
          fetchProjectBySlug(cleanSlug),
        ]);

        if (!isMounted) return;

        const loadedProjects = projectsList.status === 'fulfilled' && Array.isArray(projectsList.value)
          ? projectsList.value
          : [];
        setAllProjects(loadedProjects);

        let targetProject = null;
        if (directProject.status === 'fulfilled' && directProject.value && !directProject.value.detail) {
          targetProject = directProject.value;
        } else if (loadedProjects.length > 0) {
          // Find matching project by slug or name
          targetProject = loadedProjects.find((p) => {
            const pSlug = (p.slug || p.project_name || p.title || '').toLowerCase().replace(/[^a-z0-9-]/g, '');
            return pSlug === cleanSlug || pSlug.includes(cleanSlug) || cleanSlug.includes(pSlug);
          }) || loadedProjects[0];
        }

        if (targetProject) {
          setProject(targetProject);
          setLikes(targetProject.likes || 0);
          setViews(targetProject.views || 0);
          document.title = `${targetProject.project_name || targetProject.title} Technical Documentation | Roshan Damor`;

          // Track view counter via API
          const projectSlugToTrack = targetProject.slug || cleanSlug;
          viewProject(projectSlugToTrack).then((res) => {
            if (res && typeof res.views === 'number' && isMounted) {
              setViews(res.views);
            }
          }).catch(() => {
            // Ignore interaction tracking errors
          });
        } else {
          setError('Project not found');
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Failed to load project');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, [cleanSlug]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [cleanSlug]);

  const handleLike = useCallback(async () => {
    if (hasLiked || isLiking || !project) return;
    setIsLiking(true);

    try {
      const projectSlugToLike = project.slug || cleanSlug;
      const res = await likeProject(projectSlugToLike);
      if (res && res.success) {
        setLikes(res.likes || likes + 1);
        setHasLiked(true);
      } else {
        setLikes((prev) => prev + 1);
        setHasLiked(true);
      }
    } catch {
      setLikes((prev) => prev + 1);
      setHasLiked(true);
    } finally {
      setIsLiking(false);
    }
  }, [hasLiked, isLiking, project, cleanSlug, likes]);

  const projectName = project?.project_name || project?.title || 'Project Case Study';
  const categoryName = project?.category?.name || 'Software Engineering';
  const projectKey = (project?.slug || projectName || '').toLowerCase().replace(/[^a-z0-9]/g, '');
  const statusInfo = resolveStatusDisplay(project?.status);

  // Normalize tech list
  const techList = useMemo(() => {
    if (!project) return [];
    if (Array.isArray(project.technologies_list) && project.technologies_list.length > 0) {
      return project.technologies_list;
    }
    if (typeof project.technologies === 'string') {
      return project.technologies.split(',').map((t) => t.trim()).filter(Boolean);
    }
    return [];
  }, [project]);

  // Gallery items from dynamic screenshots or fallback
  const gallery = useMemo(() => {
    if (project?.screenshots && Array.isArray(project.screenshots) && project.screenshots.length > 0) {
      return project.screenshots.map((s, idx) => ({
        src: s.image,
        title: s.caption || `${projectName} - Screenshot ${idx + 1}`,
        caption: s.caption || `High-resolution preview of ${projectName} system interfaces.`,
      }));
    }

    if (project?.thumbnail) {
      return [
        {
          src: project.thumbnail,
          title: `${projectName} Overview`,
          caption: project.description || `${projectName} production architecture and interface.`,
        },
      ];
    }

    return [
      {
        src: '/static/images/hero.webp',
        title: `${projectName} Architectural Overview`,
        caption: project?.description || `${projectName} system architecture.`,
      },
    ];
  }, [project, projectName]);

  // Prev / Next Project
  const { prevProject, nextProject } = useMemo(() => {
    if (!allProjects.length) return { prevProject: null, nextProject: null };
    const currentIndex = allProjects.findIndex((p) => (p.slug || p.title) === (project?.slug || project?.title));
    const safeIdx = currentIndex >= 0 ? currentIndex : 0;
    const prev = allProjects[(safeIdx - 1 + allProjects.length) % allProjects.length];
    const next = allProjects[(safeIdx + 1) % allProjects.length];
    return { prevProject: prev, nextProject: next };
  }, [allProjects, project]);

  const getSlugOf = (p) => p?.slug || (p?.project_name || p?.title || '').toLowerCase().replace(/[^a-z0-9]/g, '');

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % gallery.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="page-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', fontSize: '32px', color: '#a78bfa', marginBottom: '16px' }}>
            <i className="fas fa-spinner fa-spin"></i>
          </div>
          <h2 style={{ color: 'rgba(255,255,255,0.9)', fontSize: '20px' }}>Loading project architecture...</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px' }}>Fetching dynamic telemetry, case study docs, and screenshots from API</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="page-container">
        <div className="page-wrapper" style={{ padding: '40px 20px' }}>
          <div className="empty-state-card" style={{ maxWidth: '680px', margin: '40px auto' }}>
            <div className="empty-state-grid-pattern"></div>
            <div className="empty-state-glow"></div>
            <div className="empty-state-orbit">
              <div className="empty-state-orbit-ring"></div>
              <div className="empty-state-icon-box">
                <i className="fas fa-cubes"></i>
              </div>
            </div>
            <div className="empty-state-badge">
              <span className="badge-dot"></span>
              Project Catalog
            </div>
            <h2 className="empty-state-title">Project Case Study Not Found</h2>
            <p className="empty-state-desc">
              The requested project documentation could not be found or has not been published yet in DevAdmin.
            </p>
            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', justifyContent: 'center', position: 'relative', zIndex: 1 }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => onNavigate('home', 'projects')}
                style={{ padding: '12px 28px' }}
              >
                <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i> Return to Projects
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => onNavigate('home')}
                style={{ padding: '12px 24px' }}
              >
                <i className="fas fa-home" style={{ marginRight: '8px' }}></i> Portfolio Home
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            {project.description}
          </p>
        </header>

        {/* Unified Documentation Container */}
        <div className="project-detail-hero-card">
          {/* Screenshot Slider Gallery */}
          <div className="project-screenshot-slider">
            <div className="screenshot-slide-stage">
              <img
                src={gallery[activeSlide]?.src || '/static/images/hero.webp'}
                alt={gallery[activeSlide]?.title || projectName}
                className="screenshot-slide-img"
              />
              <div className="screenshot-slide-overlay">
                <div className="screenshot-slide-info">
                  <span className="screenshot-slide-badge">
                    <i className="fas fa-image"></i> Screenshot {activeSlide + 1} of {gallery.length}
                  </span>
                  <h3 className="screenshot-slide-title">{gallery[activeSlide]?.title}</h3>
                  <p className="screenshot-slide-caption">{gallery[activeSlide]?.caption}</p>
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

          {/* Meta Row with Status, Links & Interaction Telemetry */}
          <div className="project-detail-header-info">
            <div className="project-detail-meta-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <span className={`project-status-badge ${statusInfo.cls}`} style={{ fontSize: '14px', padding: '6px 14px' }}>
                  {statusInfo.text}
                </span>

                {/* Telemetry Stats: Views & Likes */}
                <span style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <i className="fas fa-eye" style={{ color: '#38bdf8' }}></i> {views} Views
                </span>
                <button
                  type="button"
                  onClick={handleLike}
                  disabled={hasLiked || isLiking}
                  style={{
                    background: hasLiked ? 'rgba(244, 63, 94, 0.2)' : 'rgba(255, 255, 255, 0.08)',
                    border: hasLiked ? '1px solid #f43f5e' : '1px solid rgba(255, 255, 255, 0.15)',
                    color: hasLiked ? '#fb7185' : '#fff',
                    borderRadius: '20px',
                    padding: '4px 12px',
                    fontSize: '13px',
                    cursor: hasLiked ? 'default' : 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.2s ease',
                  }}
                  title={hasLiked ? 'Liked!' : 'Like this project'}
                >
                  <i className={`fas fa-heart ${hasLiked ? 'text-rose-500' : ''}`} style={{ color: hasLiked ? '#f43f5e' : '#fda4af' }}></i>
                  <span>{likes}</span>
                </button>
              </div>

              <div className="project-detail-links">
                {project.github_url && (
                  <a
                    href={safeUrl(project.github_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs-link-pill secondary"
                  >
                    <i className="fab fa-github"></i> GitHub Repo
                  </a>
                )}
                {project.live_url && (
                  <a
                    href={safeUrl(project.live_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs-link-pill primary"
                  >
                    <i className="fas fa-globe"></i> Live Application
                  </a>
                )}
                {project.demo_url && (
                  <a
                    href={safeUrl(project.demo_url)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs-link-pill secondary"
                  >
                    <i className="fas fa-play"></i> Demo
                  </a>
                )}
              </div>
            </div>

            {/* Tech Stack List */}
            {techList.length > 0 && (
              <div className="project-detail-tech-stack">
                {techList.map((t, idx) => (
                  <span key={idx} className="project-tech-badge" style={{ fontSize: '13px', padding: '6px 14px' }}>
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════
             DYNAMIC DOCUMENTATION FLOW
             ══════════════════════════════════════════════════════════════ */}

          {/* 1. Executive Overview & Problem Context */}
          <section id="doc-overview" className="doc-page-section">
            <div className="doc-section-heading-wrap">
              <span className="doc-badge-pill">
                <i className="fas fa-book-open"></i> Section 1: Executive Overview
              </span>
              <h2 className="doc-section-title">Context, Problem Statement &amp; Architecture Strategy</h2>
            </div>

            {project.documentation ? (
              <div className="case-study-injected" dangerouslySetInnerHTML={{ __html: project.documentation }} />
            ) : (
              <p style={{ color: 'rgba(255,255,255,0.78)', fontSize: '15px', lineHeight: '1.65' }}>
                {project.description}
              </p>
            )}
          </section>

          {/* 2. Interactive System Architecture Topology (React Flow, D2, Mermaid ERD & KaTeX) */}
          <section id="doc-architecture" className="doc-page-section">
            <div className="doc-section-heading-wrap">
              <span className="doc-badge-pill">
                <i className="fas fa-network-wired"></i> Section 2: Interactive Architecture &amp; Mathematical Telemetry
              </span>
              <h2 className="doc-section-title">High-Availability Topology, ERD Schemas &amp; Performance Models</h2>
            </div>
            <InteractiveArchitecture />
            <ComplexDiagramD2 scenarioKey={projectKey} />

            {/* Dynamic Mermaid ERD / Sequence Pipeline */}
            {PROJECT_MERMAID_SCHEMAS[projectKey] && (
              <MermaidDiagram
                chart={PROJECT_MERMAID_SCHEMAS[projectKey].chart}
                title={PROJECT_MERMAID_SCHEMAS[projectKey].title}
                subtitle={PROJECT_MERMAID_SCHEMAS[projectKey].subtitle}
                diagramType={PROJECT_MERMAID_SCHEMAS[projectKey].type}
              />
            )}

            {/* Dynamic KaTeX Performance / SLA Mathematical Formulation */}
            {PROJECT_KATEX_MODELS[projectKey] && (
              <KaTeXFormula
                formula={PROJECT_KATEX_MODELS[projectKey].formula}
                title={PROJECT_KATEX_MODELS[projectKey].title}
                description={PROJECT_KATEX_MODELS[projectKey].description}
                variables={PROJECT_KATEX_MODELS[projectKey].variables}
              />
            )}
          </section>

          {/* 3. Media Gallery Lightbox & Video Showcase */}
          <section id="doc-media" className="doc-page-section">
            <div className="doc-section-heading-wrap">
              <span className="doc-badge-pill">
                <i className="fas fa-photo-video"></i> Section 3: Media &amp; Live Walkthrough
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
        {prevProject && nextProject && (
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
        )}

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
