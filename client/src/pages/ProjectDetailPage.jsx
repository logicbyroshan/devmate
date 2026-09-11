import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { fetchProjectBySlug, fetchProjects, likeProject, viewProject } from '../api/portfolioApi';
import { safeUrl, resolveStatusDisplay } from '../api/hydratePortfolio';
import InteractiveArchitecture from '../components/doc/InteractiveArchitecture';
import ComplexDiagramD2 from '../components/doc/ComplexDiagramD2';
import ImageLightbox from '../components/doc/ImageLightbox';
import VideoShowcase from '../components/doc/VideoShowcase';

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
        <div className="page-wrapper" style={{ padding: '80px 20px', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', fontSize: '48px', color: '#f87171', marginBottom: '16px' }}>
            <i className="fas fa-exclamation-triangle"></i>
          </div>
          <h2 style={{ color: '#fff', fontSize: '24px', marginBottom: '12px' }}>Project Not Found</h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', maxWidth: '480px', margin: '0 auto 28px' }}>
            The requested project could not be found or has been moved. Explore other projects from the catalog.
          </p>
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => onNavigate('home', 'projects')}
          >
            <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i> Return to Projects
          </button>
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
