import React, { useState, useEffect } from 'react';

export default function AppNavbar({ currentRoute, onNavigate }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  const handleNav = (e, target, anchor) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    onNavigate(target, anchor);
  };

  const handleModal = (modalId) => {
    setMobileMenuOpen(false);
    if (typeof window.openModal === 'function') {
      window.openModal(modalId);
    } else {
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.classList.add('modal-visible');
        document.body.classList.add('modal-open');
      }
    }
  };

  return (
    <>
      {/* Navigation for Desktop - Exact Original Navbar Structure */}
      <div className="navbar navbar-desktop">
        <div className="container nav-container">
          <nav role="navigation" className="nav-menu">
            <a
              href="#skills"
              className="nav-link"
              onClick={(e) => handleNav(e, 'home', 'skills')}
            >
              Skills
            </a>
            <a
              href="#projects"
              className="nav-link"
              onClick={(e) => handleNav(e, 'home', 'projects')}
            >
              Projects
            </a>
            <a
              href="#experience"
              className="nav-link"
              onClick={(e) => handleNav(e, 'home', 'experience')}
            >
              Experience
            </a>
            <a
              href="/about"
              className="nav-link"
              onClick={(e) => handleNav(e, 'about')}
            >
              About
            </a>
          </nav>

          <a
            href="/"
            className="brand"
            onClick={(e) => handleNav(e, 'home')}
            aria-label="Roshan Damor Logo"
          >
            <img
              src="/static/images/logo.webp"
              alt="Roshan Damor Logo"
              className="logo-image"
              width="48"
              height="48"
              decoding="async"
            />
          </a>

          <div className="nav-actions">
            <button
              type="button"
              className="btn btn-secondary btn-nav"
              onClick={() => handleModal('modal-resume')}
              aria-label="View Resume"
            >
              Resume
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => handleModal('modal-video-resume')}
              aria-label="Watch Video Resume"
            >
              Video Resume
            </button>
          </div>
        </div>
      </div>

      {/* Navigation for Mobile - Exact Original Navbar Structure */}
      <div className="navbar navbar-mobile">
        <div className="container nav-container-mobile">
          <button
            className={`hamburger-menu ${mobileMenuOpen ? 'active' : ''}`}
            id="hamburgerMenu"
            aria-label="Toggle mobile menu"
            aria-expanded={mobileMenuOpen}
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span></span>
            <span></span>
            <span></span>
          </button>

          <a
            href="/"
            className="brand"
            onClick={(e) => handleNav(e, 'home')}
            aria-label="Roshan Damor Logo"
          >
            <img
              src="/static/images/logo.webp"
              alt="Roshan Damor Logo"
              className="logo-image"
              width="44"
              height="44"
              decoding="async"
            />
          </a>

          <button
            type="button"
            className="btn btn-primary mobile-resume-btn"
            onClick={() => handleModal('modal-resume')}
            aria-label="Resume"
          >
            <i className="fas fa-file-alt"></i>
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`} id="mobileMenu">
          <nav className="mobile-nav">
            <a
              href="#skills"
              className="mobile-nav-link"
              onClick={(e) => handleNav(e, 'home', 'skills')}
            >
              Skills
            </a>
            <a
              href="#projects"
              className="mobile-nav-link"
              onClick={(e) => handleNav(e, 'home', 'projects')}
            >
              Projects
            </a>
            <a
              href="#experience"
              className="mobile-nav-link"
              onClick={(e) => handleNav(e, 'home', 'experience')}
            >
              Experience
            </a>
            <a
              href="/about"
              className="mobile-nav-link"
              onClick={(e) => handleNav(e, 'about')}
            >
              About
            </a>
          </nav>
          <div className="mobile-nav-actions" style={{ padding: '0 30px', display: 'flex', gap: '10px' }}>
            <button
              type="button"
              className="btn btn-secondary btn-nav"
              style={{ flex: 1 }}
              onClick={() => handleModal('modal-resume')}
            >
              Resume
            </button>
            <button
              type="button"
              className="btn btn-primary"
              style={{ flex: 1 }}
              onClick={() => handleModal('modal-video-resume')}
            >
              Video Resume
            </button>
          </div>
        </div>

        {/* Mobile Overlay */}
        <div
          className={`mobile-overlay ${mobileMenuOpen ? 'active' : ''}`}
          id="mobileOverlay"
          onClick={() => setMobileMenuOpen(false)}
        ></div>
      </div>
    </>
  );
}
