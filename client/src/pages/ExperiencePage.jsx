import React, { useEffect } from 'react';

export default function ExperiencePage({ onNavigate }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Professional Experience & Engineering Roadmap | Roshan Damor';
  }, []);

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Hero Header */}
        <header className="page-hero">
          <span className="page-badge">
            <i className="fas fa-briefcase"></i> Work History &amp; Roadmap
          </span>
          <h1 className="page-title">
            Engineering <span className="text-gradient">Experience</span>
          </h1>
          <p className="page-subtitle">
            A comprehensive breakdown of professional roles, core architecture decisions, scaled systems, and technical leadership.
          </p>
        </header>

        {/* Experience Deep Dive 1: Adarsh ID Cards */}
        <article className="exp-deep-card">
          <div className="exp-card-header">
            <div>
              <h2 className="exp-role-title">Software Engineer</h2>
              <div className="exp-company-name">
                <i className="fas fa-building"></i> Adarsh ID Cards
              </div>
            </div>
            <span className="exp-duration-badge">
              <i className="far fa-calendar-alt"></i> Dec 2025 – Present · Full-time
            </span>
          </div>

          <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '24px' }}>
            Spearheading end-to-end software engineering and system architecture for <strong>CardFlow</strong>, an enterprise SaaS platform for high-throughput identity card issuance, batch image rendering, and live printing workflow operations across schools, colleges, and corporations.
          </p>

          {/* Pillars of Engineering Grid */}
          <div className="exp-pillars-grid">
            <div className="exp-pillar-card">
              <h4><i className="fas fa-microchip"></i> High-Throughput Processing</h4>
              <p>Designed asynchronous image and PDF generation pipelines using Celery &amp; Redis, capable of processing hundreds of high-res student cards concurrently without HTTP timeouts.</p>
            </div>
            <div className="exp-pillar-card">
              <h4><i className="fas fa-database"></i> Database &amp; Query Optimization</h4>
              <p>Structured relational schemas in PostgreSQL with selective indexing and connection pooling, delivering sub-50ms query latencies across 136,000+ generated records.</p>
            </div>
            <div className="exp-pillar-card">
              <h4><i className="fas fa-shield-alt"></i> Enterprise RBAC &amp; Security</h4>
              <p>Built granular Role-Based Access Control allowing multi-tenant school administrators, design operators, and billing managers isolated, audited data access.</p>
            </div>
            <div className="exp-pillar-card">
              <h4><i className="fas fa-desktop"></i> Cross-Platform Desktop Client</h4>
              <p>Engineered an Electron desktop companion application for local direct-to-card printer hardware integration and offline batch caching.</p>
            </div>
          </div>

          {/* Key Scale Numbers */}
          <div className="cs-metrics-grid" style={{ margin: '28px 0 20px' }}>
            <div className="cs-metric-card">
              <div className="cs-metric-num">1,000+</div>
              <div className="cs-metric-label">Active Users</div>
            </div>
            <div className="cs-metric-card">
              <div className="cs-metric-num">136k+</div>
              <div className="cs-metric-label">Cards Processed</div>
            </div>
            <div className="cs-metric-card">
              <div className="cs-metric-num">86k+</div>
              <div className="cs-metric-label">Batch Downloads</div>
            </div>
            <div className="cs-metric-card">
              <div className="cs-metric-num">99.9%</div>
              <div className="cs-metric-label">System Uptime</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px' }}>
            {['Python', 'Django', 'React', 'PostgreSQL', 'Redis', 'Celery', 'REST APIs', 'Electron', 'Docker', 'Linux'].map((t, i) => (
              <span key={i} className="project-tech-badge">{t}</span>
            ))}
          </div>
        </article>

        {/* Experience Deep Dive 2: Miracle Organisation */}
        <article className="exp-deep-card">
          <div className="exp-card-header">
            <div>
              <h2 className="exp-role-title">Graphic Designer Intern</h2>
              <div className="exp-company-name">
                <i className="fas fa-palette"></i> Miracle Organisation
              </div>
            </div>
            <span className="exp-duration-badge">
              <i className="far fa-calendar-alt"></i> Apr 2025 – May 2025 · 1 Month
            </span>
          </div>

          <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '20px' }}>
            Crafted digital brand assets, corporate identity collateral, marketing campaign graphics, and print media layouts. Focused on typography hierarchy, color psychology, and precision vector design for public engagement initiatives.
          </p>

          <div className="exp-pillars-grid">
            <div className="exp-pillar-card">
              <h4><i className="fas fa-vector-square"></i> Brand Identity</h4>
              <p>Developed unified brand guidelines, vector logo assets, and social media creative kits for promotional campaigns.</p>
            </div>
            <div className="exp-pillar-card">
              <h4><i className="fas fa-print"></i> Print &amp; Digital Media</h4>
              <p>Prepared high-resolution print layouts with strict CMYK bleed configurations and web-optimized UI banners.</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '20px' }}>
            {['Figma', 'Adobe Photoshop', 'Adobe Illustrator', 'UI/UX Design', 'Visual Hierarchy', 'Typography'].map((t, i) => (
              <span key={i} className="project-tech-badge">{t}</span>
            ))}
          </div>
        </article>

        {/* Back to Home CTA */}
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '14px 36px', fontSize: '15px' }}
            onClick={() => onNavigate('home', 'experience')}
          >
            <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i> Return to Portfolio Home
          </button>
        </div>
      </div>
    </div>
  );
}
