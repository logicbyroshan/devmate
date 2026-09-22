import React, { useState, useEffect } from 'react';
import { fetchExperiences } from '../api/portfolioApi';
import { safeUrl } from '../api/hydratePortfolio';

function formatExperienceDuration(startDate, endDate, currentlyWorking) {
  if (!startDate) return 'Timeline not specified';

  const start = new Date(startDate);
  const startLabel = Number.isNaN(start.getTime())
    ? String(startDate)
    : start.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  if (currentlyWorking) {
    return `${startLabel} – Present`;
  }

  if (!endDate) {
    return startLabel;
  }

  const end = new Date(endDate);
  const endLabel = Number.isNaN(end.getTime())
    ? String(endDate)
    : end.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

  return `${startLabel} – ${endLabel}`;
}

export default function ExperiencePage({ onNavigate }) {
  const [experiences, setExperiences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'Professional Experience & Engineering Roadmap | Roshan Damor';

    let isMounted = true;
    async function loadData() {
      try {
        const data = await fetchExperiences();
        if (!isMounted) return;
        if (Array.isArray(data)) {
          setExperiences(data);
        }
      } catch (err) {
        if (isMounted) setError(err.message || 'Failed to load experience records');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
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

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '32px', color: '#a78bfa', marginBottom: '16px' }}>
              <i className="fas fa-spinner fa-spin"></i>
            </div>
            <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px' }}>Loading professional work history...</p>
          </div>
        ) : error ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#f87171' }}>
            <i className="fas fa-exclamation-triangle" style={{ fontSize: '32px', marginBottom: '12px' }}></i>
            <p>{error}</p>
          </div>
        ) : experiences.length === 0 ? (
          <div className="empty-state-card" style={{ maxWidth: '640px', margin: '40px auto' }}>
            <div className="empty-state-glow"></div>
            <div className="empty-state-icon-wrapper">
              <i className="fas fa-briefcase"></i>
            </div>
            <div className="empty-state-badge">
              <span className="badge-dot"></span>
              Career Roadmap
            </div>
            <h3 className="empty-state-title">Career Timeline Updating</h3>
            <p className="empty-state-desc">
              Professional engineering roles, system architectures, and technical leadership milestones are currently being synchronized from DevAdmin.
            </p>
            <div className="empty-state-status-pill">
              <i className="fas fa-satellite-dish" style={{ color: '#38bdf8' }}></i>
              <span>Connected to DevAdmin API</span>
            </div>
          </div>
        ) : (
          experiences.map((exp, index) => {
            const durationLabel = exp.duration || formatExperienceDuration(exp.start_date, exp.end_date, exp.currently_working);
            const companyName = exp.company_name || 'Organization';
            const position = exp.position || 'Engineering Role';
            const location = exp.location || '';
            const employmentType = exp.employment_type ? exp.employment_type.replace('-', ' ') : 'Full-time';

            return (
              <article key={exp.id || index} className="exp-deep-card">
                <div className="exp-card-header">
                  <div>
                    <h2 className="exp-role-title">{position}</h2>
                    <div className="exp-company-name">
                      <i className="fas fa-building"></i>{' '}
                      {exp.company_website ? (
                        <a
                          href={safeUrl(exp.company_website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'inherit', textDecoration: 'none' }}
                        >
                          {companyName} <i className="fas fa-external-link-alt" style={{ fontSize: '11px', marginLeft: '4px' }}></i>
                        </a>
                      ) : (
                        companyName
                      )}
                      {location && <span style={{ opacity: 0.7, marginLeft: '8px', fontSize: '13px' }}>· {location}</span>}
                    </div>
                  </div>
                  <span className="exp-duration-badge">
                    <i className="far fa-calendar-alt"></i> {durationLabel} · {employmentType}
                  </span>
                </div>

                {exp.short_description && (
                  <p style={{ fontSize: '16px', lineHeight: '1.7', color: 'rgba(255, 255, 255, 0.9)', marginBottom: '20px' }}>
                    {exp.short_description}
                  </p>
                )}

                {exp.detailed_description && (
                  <div
                    className="case-study-injected"
                    style={{ fontSize: '15px', lineHeight: '1.7', color: 'rgba(255, 255, 255, 0.85)', marginBottom: '20px' }}
                    dangerouslySetInnerHTML={{ __html: exp.detailed_description }}
                  />
                )}

                {/* Associated Workplace/Experience Images */}
                {exp.images && Array.isArray(exp.images) && exp.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
                    {exp.images.map((imgItem, imgIdx) => (
                      <div key={imgIdx} style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <img
                          src={safeUrl(imgItem.image)}
                          alt={imgItem.caption || `${position} at ${companyName}`}
                          style={{ width: '100%', height: '140px', objectFit: 'cover' }}
                          loading="lazy"
                        />
                        {imgItem.caption && (
                          <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', padding: '6px 8px', background: 'rgba(0,0,0,0.4)' }}>
                            {imgItem.caption}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </article>
            );
          })
        )}

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
