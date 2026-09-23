import React, { useState, useEffect, useRef } from 'react';

export default function AppNavbar({ currentRoute, onNavigate }) {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > 60 && currentScrollY > lastScrollY.current + 5) {
        setHidden(true);
      } else if (currentScrollY < lastScrollY.current - 5 || currentScrollY <= 20) {
        setHidden(false);
      }
      lastScrollY.current = Math.max(0, currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNav = (e, target, anchor) => {
    e.preventDefault();
    onNavigate(target, anchor);
  };

  const isAboutActive = currentRoute === 'about' || (typeof currentRoute === 'object' && currentRoute?.name === 'about');
  const isExperienceActive = currentRoute === 'experience' || (typeof currentRoute === 'object' && currentRoute?.name === 'experience');

  return (
    <header className={`navbar navbar-tabbar ${hidden ? 'navbar-hidden' : ''}`} id="mainNavbar">
      <nav className="nav-tabbar-menu" aria-label="Main Navigation">
        <a
          href="#skills"
          className="nav-tab-link"
          onClick={(e) => handleNav(e, 'home', 'skills')}
        >
          <span>Skills</span>
        </a>
        <a
          href="#projects"
          className="nav-tab-link"
          onClick={(e) => handleNav(e, 'home', 'projects')}
        >
          <span>Projects</span>
        </a>
        <a
          href="#experience"
          className={`nav-tab-link ${isExperienceActive ? 'active' : ''}`}
          onClick={(e) => handleNav(e, 'home', 'experience')}
        >
          <span>Experience</span>
        </a>
        <a
          href="/about"
          className={`nav-tab-link ${isAboutActive ? 'active' : ''}`}
          onClick={(e) => handleNav(e, 'about')}
        >
          <span>About</span>
        </a>
      </nav>
    </header>
  );
}
