import React, { useEffect } from 'react';

export default function AboutPage({ onNavigate }) {
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    document.title = 'About Me & Engineering Profile | Roshan Damor';
  }, []);

  const SKILL_DOMAINS = [
    {
      title: 'Software Engineering',
      icon: 'fa-puzzle-piece',
      skills: ['Python', 'Java', 'C/C++', 'JavaScript', 'Django', 'FastAPI', 'Flask', 'Node.js', 'REST APIs', 'System Design', 'Git'],
    },
    {
      title: 'AI & Data Engineering',
      icon: 'fa-robot',
      skills: ['LLMs & RAG', 'AI Agents', 'AI Workflows', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'NumPy', 'Pandas', 'ML Pipelines'],
    },
    {
      title: 'Application Development',
      icon: 'fa-globe',
      skills: ['React', 'Vue', 'HTML5/CSS3', 'Tailwind CSS', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'React Native', 'Electron'],
    },
    {
      title: 'Infrastructure & DevOps',
      icon: 'fa-cloud',
      skills: ['Docker', 'Nginx', 'Gunicorn', 'Linux/Bash', 'Celery', 'Redis Queue', 'GitHub Actions', 'CI/CD Pipelines', 'Cloud Deployment'],
    },
  ];

  return (
    <div className="page-container">
      <div className="page-wrapper">
        {/* Hero Header */}
        <header className="page-hero">
          <span className="page-badge">
            <i className="fas fa-user-tie"></i> Full Profile &amp; Background
          </span>
          <h1 className="page-title">
            About <span className="text-gradient">Roshan Damor</span>
          </h1>
          <p className="page-subtitle">
            Software Engineer focused on high-concurrency backend systems, scalable SaaS platforms, and production AI architectures.
          </p>
        </header>

        {/* Two-Column About Grid */}
        <div className="about-page-grid">
          {/* Left Sidebar Profile */}
          <aside className="about-page-sidebar">
            <div className="about-profile-card">
              <div className="about-avatar-wrap">
                <img
                  src="/static/images/hero.webp"
                  alt="Roshan Damor"
                  width="140"
                  height="140"
                />
              </div>
              <h2 className="about-sidebar-name">Roshan Damor</h2>
              <p className="about-sidebar-role">Software Engineer · Full Stack AI</p>

              <div className="about-stat-row">
                <div className="about-stat-item">
                  <div className="about-stat-value">1,300+</div>
                  <div className="about-stat-label">DSA Solved</div>
                </div>
                <div className="about-stat-item">
                  <div className="about-stat-value">1,000+</div>
                  <div className="about-stat-label">Active Users</div>
                </div>
                <div className="about-stat-item">
                  <div className="about-stat-value">136k+</div>
                  <div className="about-stat-label">Cards Output</div>
                </div>
                <div className="about-stat-item">
                  <div className="about-stat-value">99.9%</div>
                  <div className="about-stat-label">SaaS Uptime</div>
                </div>
              </div>

              <div style={{ textAlign: 'left', borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '16px' }}>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '6px 0' }}>
                  <i className="fas fa-envelope" style={{ width: '20px', color: '#a78bfa' }}></i> mail@logicbyroshan.in
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '6px 0' }}>
                  <i className="fas fa-globe" style={{ width: '20px', color: '#38bdf8' }}></i> logicbyroshan.in
                </p>
                <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.7)', margin: '6px 0' }}>
                  <i className="fas fa-map-marker-alt" style={{ width: '20px', color: '#34d399' }}></i> Bhopal, Madhya Pradesh, India
                </p>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '20px' }}>
                <a
                  href="https://github.com/logicbyroshan"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cs-link-pill secondary"
                  style={{ padding: '8px 16px', fontSize: '13px' }}
                >
                  <i className="fab fa-github"></i> GitHub
                </a>
                <a
                  href="mailto:mail@logicbyroshan.in"
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
                I am a passionate <strong>Software Engineer</strong> who thrives at the intersection of algorithmic efficiency, robust backend architectures, and responsive user experiences. Currently at <strong>Adarsh ID Cards</strong>, I architect and build <strong>CardFlow</strong>—a production SaaS platform that automates large-scale student identity card generation, asynchronous image processing, and direct printing pipelines for over 1,000+ daily active users.
              </p>
              <p>
                With more than <strong>1,300+ algorithmic problems solved</strong> across LeetCode, CodeForces, and HackerRank, I focus on building systems that don&apos;t just work on day one, but scale reliably with predictable latencies, sound database design, and defensive error handling.
              </p>
            </section>

            {/* Skills Breakdown */}
            <section className="about-article-section">
              <h3 className="about-sec-heading">
                <i className="fas fa-layer-group"></i> Technical Core Proficiencies
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '16px' }}>
                {SKILL_DOMAINS.map((domain, idx) => (
                  <div key={idx} className="exp-pillar-card">
                    <h4 style={{ fontSize: '15px', color: '#38bdf8', marginBottom: '10px' }}>
                      <i className={`fas ${domain.icon}`}></i> {domain.title}
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
            </section>

            {/* Resume Downloads */}
            <section className="about-article-section">
              <h3 className="about-sec-heading">
                <i className="fas fa-file-download"></i> Download Resume &amp; Connect
              </h3>
              <p>
                Access verified resume documents or connect directly for engineering roles and collaborations:
              </p>
              <div className="resume-download-grid">
                <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate('home', 'contact'); }} className="resume-download-card">
                  <i className="fas fa-file-pdf resume-download-icon"></i>
                  <div>
                    <div className="resume-download-title">PDF Resume</div>
                    <div className="resume-download-sub">Optimized for ATS &amp; Engineering Hiring</div>
                  </div>
                </a>
                <a href="#contact" onClick={(e) => { e.preventDefault(); onNavigate('home', 'contact'); }} className="resume-download-card">
                  <i className="fas fa-file-word resume-download-icon"></i>
                  <div>
                    <div className="resume-download-title">Word Document</div>
                    <div className="resume-download-sub">Editable format for HR departments</div>
                  </div>
                </a>
                <a href="https://github.com/logicbyroshan" target="_blank" rel="noopener noreferrer" className="resume-download-card">
                  <i className="fab fa-github resume-download-icon"></i>
                  <div>
                    <div className="resume-download-title">GitHub Profile</div>
                    <div className="resume-download-sub">15+ Repositories &amp; Open Source code</div>
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
