import React, { useState, useEffect, useMemo } from 'react';
import { fetchProfile, fetchSkills, fetchSummary } from '../api/portfolioApi';
import { safeUrl, getCategoryIcon } from '../api/hydratePortfolio';

export default function AboutPage({ onNavigate }) {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });

    let isMounted = true;
    async function loadData() {
      try {
        const [profRes, skillsRes, sumRes] = await Promise.allSettled([
          fetchProfile(),
          fetchSkills(),
          fetchSummary(),
        ]);

        if (!isMounted) return;

        if (profRes.status === 'fulfilled' && profRes.value && !profRes.value.detail) {
          setProfile(profRes.value);
          document.title = `About ${profRes.value.full_name || 'Roshan Damor'} | Software Engineer`;
        }

        if (skillsRes.status === 'fulfilled' && Array.isArray(skillsRes.value)) {
          setSkills(skillsRes.value);
        }

        if (sumRes.status === 'fulfilled' && sumRes.value) {
          setSummary(sumRes.value);
        }
      } catch {
        // Fallback gracefully if any request fails
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  const fullName = profile?.full_name || 'Roshan Damor';
  const roleTitle = profile?.title || 'Software Engineer · Full Stack AI';
  const email = profile?.email || 'mail@logicbyroshan.in';
  const location = profile?.location || 'India';
  const github = profile?.github || 'https://github.com/logicbyroshan';
  const linkedin = profile?.linkedin || 'https://linkedin.com';
  const website = profile?.website || 'https://logicbyroshan.in';

  // Group skills dynamically by category
  const groupedSkills = useMemo(() => {
    if (!skills.length) return [];
    const map = {};
    skills.forEach((s) => {
      const catName = s.category?.name || 'Software Engineering';
      if (!map[catName]) {
        map[catName] = {
          title: catName,
          icon: getCategoryIcon(catName, s.category?.icon),
          skills: [],
        };
      }
      map[catName].skills.push(s.name);
    });
    return Object.values(map);
  }, [skills]);

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Hero Header */}
        <header className="page-hero">
          <span className="page-badge">
            <i className="fas fa-user-tie"></i> Full Profile &amp; Background
          </span>
          <h1 className="page-title">
            About <span className="text-gradient">{fullName}</span>
          </h1>
          <p className="page-subtitle">
            {profile?.bio || 'Software Engineer focused on high-concurrency backend systems, scalable SaaS platforms, and production AI architectures.'}
          </p>
        </header>

        {/* Two-Column About Grid */}
        <div className="about-page-grid">
          {/* Left Sidebar Profile */}
          <aside className="about-page-sidebar">
            <div className="about-profile-card">
              <div className="about-avatar-wrap">
                <img
                  src={profile?.profile_image ? safeUrl(profile.profile_image) : '/static/images/about/MePhoto.webp'}
                  alt={fullName}
                  width="140"
                  height="140"
                />
              </div>
              <h2 className="about-sidebar-name">{fullName}</h2>
              <p className="about-sidebar-role">{roleTitle}</p>

              <div className="about-stat-row">
                <div className="about-stat-item">
                  <div className="about-stat-value">{summary?.active_projects || '6+'}</div>
                  <div className="about-stat-label">Active Projects</div>
                </div>
                <div className="about-stat-item">
                  <div className="about-stat-value">{summary?.active_skills || '40+'}</div>
                  <div className="about-stat-label">Core Skills</div>
                </div>
                <div className="about-stat-item">
                  <div className="about-stat-value">{summary?.years_of_experience ? `${summary.years_of_experience}+` : '3+'}</div>
                  <div className="about-stat-label">Years Exp</div>
                </div>
                <div className="about-stat-item">
                  <div className="about-stat-value">99.9%</div>
                  <div className="about-stat-label">SaaS Uptime</div>
                </div>
              </div>

              <div style={{ textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '6px 0' }}>
                  <i className="fas fa-envelope" style={{ width: '20px', color: '#a78bfa' }}></i> {email}
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '6px 0' }}>
                  <i className="fas fa-globe" style={{ width: '20px', color: '#38bdf8' }}></i> {website.replace(/^https?:\/\//, '')}
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '6px 0' }}>
                  <i className="fas fa-map-marker-alt" style={{ width: '20px', color: '#34d399' }}></i> {location}
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px', flexWrap: 'wrap' }}>
                {github && (
                  <a
                    href={safeUrl(github)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs-link-pill secondary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <i className="fab fa-github"></i> GitHub
                  </a>
                )}
                {linkedin && (
                  <a
                    href={safeUrl(linkedin)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cs-link-pill secondary"
                    style={{ padding: '8px 16px', fontSize: '13px' }}
                  >
                    <i className="fab fa-linkedin-in"></i> LinkedIn
                  </a>
                )}
                <a
                  href={`mailto:${email}`}
                  className="cs-link-pill primary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <i className="fas fa-paper-plane"></i> Email
                </a>
              </div>
            </div>
          </aside>

          {/* Right Main Article */}
          <main className="about-main-article">
            {/* Story Section */}
            <section className="about-article-section">
              <h3 className="about-sec-heading">
                <i className="fas fa-terminal"></i> Engineering Philosophy &amp; Bio
              </h3>
              <p>
                I am a passionate <strong>Software Engineer</strong> who thrives at the intersection of algorithmic efficiency, robust backend architectures, and responsive user experiences. Specialized in Python, Django, React, PostgreSQL, Redis, Celery, and practical AI systems (LLMs, RAG, and AI agents).
              </p>
              <p>
                {profile?.bio || 'Focused on building high-performance systems that scale reliably with predictable sub-50ms latencies, sound relational database design, and defensive error handling.'}
              </p>
            </section>

            {/* Dynamic Skills Breakdown */}
            <section className="about-article-section">
              <h3 className="about-sec-heading">
                <i className="fas fa-layer-group"></i> Technical Core Proficiencies
              </h3>
              {loading ? (
                <div style={{ textAlign: 'center', padding: '24px' }}>
                  <i className="fas fa-spinner fa-spin" style={{ fontSize: '24px', color: '#38bdf8' }}></i>
                </div>
              ) : groupedSkills.length === 0 ? (
                <div className="empty-state-card" style={{ padding: '48px 24px', maxWidth: '100%' }}>
                  <div className="empty-state-grid-pattern"></div>
                  <div className="empty-state-glow"></div>
                  <div className="empty-state-orbit">
                    <div className="empty-state-orbit-ring"></div>
                    <div className="empty-state-icon-box">
                      <i className="fas fa-layer-group"></i>
                    </div>
                  </div>
                  <div className="empty-state-badge">
                    <span className="badge-dot"></span>
                    Live Skill Matrix
                  </div>
                  <h4 className="empty-state-title" style={{ fontSize: '20px' }}>Technical Proficiencies Updating</h4>
                  <p className="empty-state-desc" style={{ fontSize: '14px', marginBottom: '18px' }}>
                    Skill proficiencies, taxonomy domains, and framework ecosystems are actively synchronizing from DevAdmin.
                  </p>
                  <div className="empty-state-telemetry">
                    <div className="telemetry-beacon">
                      <span className="telemetry-beacon-dot"></span>
                      <span className="telemetry-beacon-pulse"></span>
                    </div>
                    <span>DevAdmin API Linked</span>
                    <span className="telemetry-tag">Sync Active</span>
                  </div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                  {groupedSkills.map((domain, idx) => (
                    <div key={idx} className="exp-pillar-card">
                      <h4 style={{ fontSize: '15px', color: '#38bdf8', marginBottom: '10px' }}>
                        <i className={domain.icon}></i> {domain.title}
                      </h4>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                        {domain.skills.map((s, si) => (
                          <span key={si} className="project-tech-badge" style={{ fontSize: '11px', padding: '4px 8px' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Resume Downloads */}
            <section className="about-article-section">
              <h3 className="about-sec-heading">
                <i className="fas fa-file-download"></i> Verified Documents &amp; Connect
              </h3>
              <p>
                Access verified resume documents or connect directly for engineering roles and collaborations:
              </p>
              <div className="resume-download-grid">
                {profile?.resume ? (
                  <a href={safeUrl(profile.resume)} target="_blank" rel="noopener noreferrer" className="resume-download-card">
                    <i className="fas fa-file-pdf resume-download-icon"></i>
                    <div>
                      <div className="resume-download-title">Verified Resume</div>
                      <div className="resume-download-sub">Download latest updated PDF resume</div>
                    </div>
                  </a>
                ) : (
                  <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate('home', 'contact'); }} className="resume-download-card">
                    <i className="fas fa-file-pdf resume-download-icon"></i>
                    <div>
                      <div className="resume-download-title">PDF Resume</div>
                      <div className="resume-download-sub">Request latest ATS-optimized resume</div>
                    </div>
                  </a>
                )}
                <a href={safeUrl(github)} target="_blank" rel="noopener noreferrer" className="resume-download-card">
                  <i className="fab fa-github resume-download-icon"></i>
                  <div>
                    <div className="resume-download-title">GitHub Profile</div>
                    <div className="resume-download-sub">Explore active repositories &amp; open source code</div>
                  </div>
                </a>
              </div>
            </section>

            {/* Education & Alma Mater */}
            <section className="about-article-section">
              <h3 className="about-sec-heading">
                <i className="fas fa-graduation-cap"></i> Education &amp; Academic Background
              </h3>
              <div className="exp-pillar-card" style={{ padding: '20px' }}>
                <h4 style={{ fontSize: '17px', color: '#f8fafc', margin: '0 0 4px 0' }}>
                  Bachelor of Technology (B.Tech) in Computer Science &amp; Engineering
                </h4>
                <p style={{ fontSize: '14px', color: '#38bdf8', fontWeight: 600, margin: '0 0 8px 0' }}>
                  University Institute of Technology, RGPV Bhopal (UIT RGPV)
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6, margin: 0 }}>
                  Specialized in Data Structures &amp; Algorithms, Object-Oriented Software Design, Distributed Systems, Database Management Systems, and Artificial Intelligence workflows. Active contributor to technical development at UIT RGPV.
                </p>
              </div>
            </section>
          </main>
        </div>

        {/* Back to Home CTA */}
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button
            type="button"
            className="btn btn-primary"
            style={{ padding: '14px 36px', fontSize: '16px' }}
            onClick={() => onNavigate('home', 'about')}
          >
            <i className="fas fa-arrow-left" style={{ marginRight: '8px' }}></i> Return to Portfolio Home
          </button>
        </div>
      </div>
    </div>
  );
}
