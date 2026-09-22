import React from 'react';

export default function SiteFooter({ onNavigate }) {
  const handleNav = (e, route, sectionId) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(route, sectionId);
    } else if (sectionId) {
      window.location.hash = `#${sectionId}`;
    }
  };

  return (
    <footer className="site-footer">
      <div className="footer-glow"></div>
      <div className="container">

        {/* Top row */}
        <div className="footer-top">
          {/* Brand Column */}
          <div className="footer-brand">
            <a 
              href="/" 
              className="brand footer-logo-link"
              onClick={(e) => handleNav(e, 'home')}
            >
              <img 
                src="/static/images/logo.webp" 
                alt="Roshan Damor" 
                className="logo-image footer-logo" 
                width="48" 
                height="48" 
                loading="lazy" 
                decoding="async" 
              />
            </a>
            <p className="footer-tagline">Crafting high-throughput digital experiences<br />one line of code at a time.</p>
            <div className="footer-socials">
              <a href="https://github.com/logicbyroshan" className="footer-social-btn" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-github"></i>
              </a>
              <a href="https://linkedin.com/in/logicbyroshan" className="footer-social-btn" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-linkedin-in"></i>
              </a>
              <a href="https://x.com/logicbyroshan" className="footer-social-btn" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                <i className="fab fa-x-twitter"></i>
              </a>
              <a href="https://leetcode.com/logicbyroshan" className="footer-social-btn" aria-label="LeetCode" target="_blank" rel="noopener noreferrer">
                <i className="fas fa-code"></i>
              </a>
            </div>
          </div>

          {/* Navigation Column */}
          <div className="footer-col">
            <h3 className="footer-col-title">Navigation</h3>
            <ul className="footer-links">
              <li>
                <a href="/" onClick={(e) => handleNav(e, 'home')}>Home</a>
              </li>
              <li>
                <a href="/about" onClick={(e) => handleNav(e, 'about')}>About</a>
              </li>
              <li>
                <a href="#skills" onClick={(e) => handleNav(e, 'home', 'skills')}>Skills</a>
              </li>
              <li>
                <a href="#projects" onClick={(e) => handleNav(e, 'home', 'projects')}>Projects</a>
              </li>
              <li>
                <a href="/experience" onClick={(e) => handleNav(e, 'experience')}>Experience</a>
              </li>
              <li>
                <a href="#contact" onClick={(e) => handleNav(e, 'home', 'contact')}>Contact Me</a>
              </li>
            </ul>
          </div>

          {/* Tech Stack Column */}
          <div className="footer-col">
            <h3 className="footer-col-title">Core Stack</h3>
            <ul className="footer-links">
              <li><span>Python &amp; Django</span></li>
              <li><span>React 18 &amp; Next.js</span></li>
              <li><span>PostgreSQL &amp; Redis</span></li>
              <li><span>Celery &amp; Linux / Nginx</span></li>
            </ul>
          </div>

          {/* Contact Column */}
          <div className="footer-col">
            <h3 className="footer-col-title">Contact</h3>
            <ul className="footer-links footer-contact-list">
              <li>
                <i className="fas fa-envelope"></i>
                <a href="mailto:mail@logicbyroshan.in" style={{ color: 'inherit', textDecoration: 'none' }}>mail@logicbyroshan.in</a>
              </li>
              <li>
                <i className="fas fa-globe"></i>
                <span>logicbyroshan.in</span>
              </li>
              <li>
                <i className="fas fa-map-marker-alt"></i>
                <span>Bhopal, MP, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="footer-divider"></div>

        {/* Bottom row */}
        <div className="footer-bottom">
          <p className="footer-copy">&copy; {new Date().getFullYear()} <span>Roshan Damor</span>. All rights reserved.</p>
          <p className="footer-made">Engineered with <i className="fas fa-heart footer-heart"></i> &amp; precision architecture</p>
        </div>

      </div>

      {/* Large Full-Width Subtle Transparent Gradient Watermark */}
      <div className="footer-big-text-wrapper" aria-hidden="true">
        <div className="footer-big-text">
          <span className="watermark-word">SOFTWARE</span>
          <span className="watermark-word">ENGINEER</span>
        </div>
      </div>
    </footer>
  );
}
